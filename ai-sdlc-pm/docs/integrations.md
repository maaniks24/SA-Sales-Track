# Integrations

All three integrations are configured per project under **Integrations** (Architect or DevOps role).
The page shows the exact URLs to paste into each tool.

## Source control (GitHub, GitLab, Bitbucket Cloud)

**Linking rule.** A commit is linked to a work item when its message or branch carries the work
item key (`FAS-12`). A pull request is linked by its title or source branch. Requirement IDs
(`DEP-REQ-214`) in commit messages or PR titles add the commit / PR to the traceability matrix.
Commits without a work item key or process ID (`CR-2026-031`, `SR-2026-00412`, `BUG-DEP-118`)
are counted against the ID-discipline metric.

Gate evidence: G4 needs a linked pull request (open or merged); G5 needs it merged.

| Provider | Where | Settings |
|----------|-------|----------|
| GitHub | Repository → Settings → Webhooks → Add webhook | Payload URL from the Integrations page, content type `application/json`, secret = project webhook secret, events: *Pushes* and *Pull requests* |
| GitLab | Project → Settings → Webhooks | URL, *Secret token* = project webhook secret, triggers: *Push events*, *Merge request events* |
| Bitbucket Cloud | Repository settings → Webhooks | URL, secret = project webhook secret, triggers: *Repository push*, *Pull request created / updated / merged / declined* |

Signatures: GitHub `X-Hub-Signature-256` and Bitbucket `X-Hub-Signature` are HMAC-SHA256 of the
body; GitLab sends the secret in `X-Gitlab-Token`. Requests with a wrong signature are rejected
(401) and logged as `REJECTED` integration events.

## Jenkins

### Report each build

`POST /api/integrations/ci/webhook/{PROJECT_KEY}` with header `X-CI-Token: <project CI token>`

```json
{
  "job": "fas-pipeline", "buildNumber": 412, "status": "SUCCESS",
  "url": "https://jenkins/job/fas-pipeline/412/", "branch": "feature/FAS-12-rfid", "commit": "9f2c…",
  "workItem": "FAS-12",
  "checks": { "PMD": "PASS", "SONAR": "PASS", "COVERAGE": "FAIL", "DUPLICATION": "PASS",
              "SECRET_SCAN": "PASS", "ID_CHECK": "PASS", "OPENAPI_DIFF": "PASS", "RTM_LINK": "PASS", "SMOKE": "PASS" },
  "testResults": [ { "reqId": "LBL-REQ-031", "testCase": "TC-LBL-031-01", "result": "PASS" } ],
  "parity": { "manual": 4, "automated": 18, "deferred": 1, "approved": 23 },
  "release": "R2026.11"
}
```

`status` is SUCCESS, FAILURE, UNSTABLE or ABORTED. The work item is taken from `workItem`, else the
key in `branch`, else the work item that owns `commit`. `BUILD` is derived from `status`.
`PARITY` passes when every planned test is accounted for (`approved = manual + automated + deferred`).

Checks each gate reads: G3 OPENAPI_DIFF · G4 BUILD, PMD, SONAR, COVERAGE, DUPLICATION, SECRET_SCAN, ID_CHECK ·
G5 SONAR, DUPLICATION, OPENAPI_DIFF · G7 PARITY · G8 RTM_LINK, PARITY · G9 SMOKE.

### Stop promotion when a gate is not approved

`GET /api/integrations/ci/gate-check?project=FAS&workItem=FAS-12&gate=G8` with `X-CI-Token`
returns `{"allowed": true|false, "stageStatus": "...", "message": "..."}`.

```groovy
pipeline {
  agent any
  environment { WI = "${(env.BRANCH_NAME =~ /FAS-\d+/) ? (env.BRANCH_NAME =~ /FAS-\d+/)[0] : ''}" }
  stages {
    stage('Build & checks') { steps { sh 'mvn -B verify' } }
    stage('Gate G8 approved?') {
      when { branch 'release/*' }
      steps {
        withCredentials([string(credentialsId: 'aisdlc-ci-token', variable: 'T')]) {
          sh '''curl -sf -H "X-CI-Token: $T" \
            "$AISDLC/api/integrations/ci/gate-check?project=FAS&workItem=$WI&gate=G8" | grep -q '"allowed":true' '''
        }
      }
    }
  }
  post {
    always {
      withCredentials([string(credentialsId: 'aisdlc-ci-token', variable: 'T')]) {
        sh '''curl -sf -X POST "$AISDLC/api/integrations/ci/webhook/FAS" -H "Content-Type: application/json" -H "X-CI-Token: $T" \
          -d "{\\"job\\":\\"$JOB_NAME\\",\\"buildNumber\\":$BUILD_NUMBER,\\"status\\":\\"${currentBuild.currentResult}\\",\\"url\\":\\"$BUILD_URL\\",\\"branch\\":\\"$BRANCH_NAME\\",\\"commit\\":\\"$GIT_COMMIT\\",\\"workItem\\":\\"$WI\\",\\"checks\\":$(cat target/aisdlc-checks.json)}"'''
      }
    }
  }
}
```

`target/aisdlc-checks.json` is a small file your quality steps write (`{"PMD":"PASS",…}`).

## Bugzilla

Settings: base URL, product, component, version and an API key (Bugzilla → Preferences → API Keys).
The key is write-only in the UI and never returned by the API.

| Action | How |
|--------|-----|
| Link an existing bug | Work item → Bugzilla tab → enter the bug ID |
| Raise a bug for an SR defect logged here | Work item → Bugzilla → *Raise in Bugzilla* (severity P1→critical, P2→major, P3→normal, P4→minor; summary prefixed with the process ID) |
| Import open bugs | Integrations → *Import open bugs*: every unresolved bug of the product/component that is not yet linked becomes an SR defect in the backlog, labelled `bugzilla` |
| Keep status current | Scheduled sync (default every 15 minutes) and *Refresh status* on a work item |
| Close the loop | When G9 is approved and *Resolve linked bugs* is on, linked bugs are set to RESOLVED / FIXED with a comment naming the work item |

Every call is recorded in the integration event log; failures also go to the system log and
show as *sync error* on the bug.
