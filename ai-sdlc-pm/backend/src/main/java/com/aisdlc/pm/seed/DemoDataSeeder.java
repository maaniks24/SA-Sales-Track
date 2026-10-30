package com.aisdlc.pm.seed;

import com.aisdlc.pm.config.AppProperties;
import com.aisdlc.pm.document.DocumentRecord;
import com.aisdlc.pm.document.DocumentService;
import com.aisdlc.pm.gate.GateService;
import com.aisdlc.pm.integration.ci.CiPayload;
import com.aisdlc.pm.integration.ci.CiService;
import com.aisdlc.pm.integration.git.GitWebhookService;
import com.aisdlc.pm.process.ProcessDefinition.StageDef;
import com.aisdlc.pm.process.ProcessService;
import com.aisdlc.pm.project.Project;
import com.aisdlc.pm.project.ProjectRepository;
import com.aisdlc.pm.project.ProjectService;
import com.aisdlc.pm.sprint.Sprint;
import com.aisdlc.pm.sprint.SprintRepository;
import com.aisdlc.pm.sprint.SprintService;
import com.aisdlc.pm.trace.Requirement;
import com.aisdlc.pm.trace.TraceService;
import com.aisdlc.pm.user.Role;
import com.aisdlc.pm.user.User;
import com.aisdlc.pm.user.UserRepository;
import com.aisdlc.pm.user.UserService;
import com.aisdlc.pm.waiver.Waiver;
import com.aisdlc.pm.waiver.WaiverService;
import com.aisdlc.pm.workitem.BoardService;
import com.aisdlc.pm.workitem.WorkItem;
import com.aisdlc.pm.workitem.WorkItem.Column;
import com.aisdlc.pm.workitem.WorkItem.StageState;
import com.aisdlc.pm.workitem.WorkItem.StageState.Status;
import com.aisdlc.pm.workitem.WorkItemRepository;
import com.aisdlc.pm.workitem.WorkItemService;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Supplier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

/**
 * Demo data for the Fixed Asset Suite. Everything goes through the real services as the real role holders,
 * so gates, separation of duties, Git and Jenkins webhooks and the audit log behave exactly as in production use.
 */
@Component
public class DemoDataSeeder {
    public static final String DEMO_PASSWORD = "Demo@2026";
    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);
    private static final String CI_TOKEN = "demo-ci-token";
    private static final String GIT_SECRET = "demo-webhook-secret";

    private final AppProperties props;
    private final UserService users;
    private final UserRepository userRepo;
    private final ProjectService projects;
    private final ProjectRepository projectRepo;
    private final WorkItemService workItems;
    private final WorkItemRepository itemRepo;
    private final BoardService board;
    private final GateService gates;
    private final DocumentService documents;
    private final ProcessService process;
    private final TraceService trace;
    private final SprintService sprints;
    private final SprintRepository sprintRepo;
    private final WaiverService waivers;
    private final CiService ci;
    private final GitWebhookService git;
    private final JsonMapper json;

    private final Map<Role, String> holder = new LinkedHashMap<>();
    private Project fas;
    private int prNumber = 40;
    private long build = 300;

    public DemoDataSeeder(AppProperties props, UserService users, UserRepository userRepo, ProjectService projects, ProjectRepository projectRepo,
                          WorkItemService workItems, WorkItemRepository itemRepo, BoardService board, GateService gates, DocumentService documents,
                          ProcessService process, TraceService trace, SprintService sprints, SprintRepository sprintRepo, WaiverService waivers,
                          CiService ci, GitWebhookService git, JsonMapper json) {
        this.props = props; this.users = users; this.userRepo = userRepo; this.projects = projects; this.projectRepo = projectRepo;
        this.workItems = workItems; this.itemRepo = itemRepo; this.board = board; this.gates = gates; this.documents = documents;
        this.process = process; this.trace = trace; this.sprints = sprints; this.sprintRepo = sprintRepo; this.waivers = waivers;
        this.ci = ci; this.git = git; this.json = json;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        if (props.seed() == null || !props.seed().enabled()) return;
        if (userRepo.count() > 0) { log.info("Seed skipped: data already present"); return; }
        long t = System.currentTimeMillis();
        try {
            seed();
            log.info("Demo data seeded in {} ms. Sign in as admin / {} or any demo user.", System.currentTimeMillis() - t, DEMO_PASSWORD);
        } catch (RuntimeException e) {
            log.error("Demo data seeding stopped part-way; the application keeps running with what was created", e);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    void seed() {
        seedUsers();
        fas = as("nandini.dm", () -> {
            Project p = new Project();
            p.key = "FAS"; p.name = "Fixed Asset Suite";
            p.description = "Fixed Assets, Depreciation, Labelling & Tracking and Data Validation & Audit — web + microservices, mobile app and internal web.";
            p.modules = new ArrayList<>(List.of("FAM", "DEP", "LBL", "AUD", "PLT"));
            p.surfaces = new ArrayList<>(List.of("WEB", "MOBILE", "INTERNAL", "API"));
            p.currentRelease = "R2026.11";
            p.contextPackVersion = "CP v1.3";
            p.integrations.git.provider = "GITHUB"; p.integrations.git.repoUrl = "https://github.com/levantare/fixed-asset-suite"; p.integrations.git.webhookSecret = GIT_SECRET;
            p.integrations.ci.url = "https://jenkins.example.internal"; p.integrations.ci.jobName = "fas-pipeline"; p.integrations.ci.token = CI_TOKEN;
            p.integrations.bugzilla.baseUrl = "https://bugzilla.example.internal"; p.integrations.bugzilla.product = "Fixed Asset Suite"; p.integrations.bugzilla.component = "All";
            return projects.create(p);
        });
        as("admin", () -> projects.create(simpleProject("MOB", "SmartAssets Mobile", "Field app for asset verification (separate release train).")));
        seedRequirements();
        Sprint[] sp = seedSprints();

        // ---- work items: a realistic spread over the board -------------------------------------------------
        WorkItem rfid = create("ravi.ba", WorkItem.Type.NF, null, null, "RFID tag scanning for physical asset verification", "LBL",
            List.of("MOBILE", "API"), "HIGH", null, 8, sp[1].id, "Field auditors scan RFID tags to verify asset location and condition; replaces manual barcode keying.");
        req(rfid, "LBL-REQ-031", "LBL-REQ-032");
        progress(rfid, "S3", true);
        pass(rfid, "S6");
        aiDeclare(rfid, "S4", "dev.arjun", 0);
        pushCommits(rfid, "dev.arjun", "feature/" + rfid.key + "-rfid-scan",
            rfid.key + " LBL-REQ-031 add RFID reader abstraction for Android and iOS",
            rfid.key + " LBL-REQ-032 verify scanned tag against asset register",
            "wip quick fix");                                     // a commit without an ID: shows up in ID discipline
        openPr(rfid, "dev.arjun");
        ciBuild(rfid, "UNSTABLE", Map.of("BUILD", "PASS", "PMD", "PASS", "SONAR", "PASS", "COVERAGE", "FAIL", "DUPLICATION", "PASS", "SECRET_SCAN", "PASS", "ID_CHECK", "FAIL"), null, List.of());
        checkSome(rfid, "S4", "dev.arjun", 3);

        WorkItem wdv = create("ravi.ba", WorkItem.Type.CR, null, "MAJOR", "Daily pro-rata WDV depreciation for mid-month additions", "DEP",
            List.of("WEB", "API"), "HIGHEST", null, 13, sp[1].id, "Written-down-value method must pro-rate by days in service instead of full month (Companies Act Schedule II).");
        req(wdv, "DEP-REQ-214", "DEP-REQ-215");
        progress(wdv, "S5", true);
        submitOnly(wdv, "S7");

        WorkItem dup = create("lakshmi.qa", WorkItem.Type.SR, WorkItem.SrKind.DEFECT, null, "Duplicate depreciation entries when month-end run is re-triggered", "DEP",
            List.of("API"), "HIGHEST", "P2", 5, sp[1].id, "Re-running the month-end job after a timeout posts a second set of depreciation journals.");
        req(dup, "DEP-REQ-214");
        bug(dup, 4182, "Duplicate depreciation journals after month-end re-run", "ASSIGNED", "major");
        progress(dup, "S1", true);
        pushCommits(dup, "dev.meera", "bugfix/" + dup.key + "-idempotent-run", dup.key + " " + dup.processId + " DEP-REQ-214 make month-end posting idempotent");
        openPr(dup, "dev.meera");
        ciBuild(dup, "SUCCESS", allPass("S4"), null, List.of());
        completeAndSubmit(dup, "S4");

        WorkItem life = create("ravi.ba", WorkItem.Type.SR, WorkItem.SrKind.SERVICE, null, "Change useful life of IT equipment class from 3 to 4 years", "FAM",
            List.of("INTERNAL"), "MEDIUM", null, 2, sp[0].id, "Finance policy change effective 1 Oct; configuration only.");
        progress(life, "S9", true);

        WorkItem export = create("ravi.ba", WorkItem.Type.NF, null, null, "Export asset audit trail to CSV for statutory auditors", "AUD",
            List.of("WEB", "API"), "HIGH", null, 5, sp[0].id, "Auditors need the full change history of an asset, filtered by period.");
        req(export, "AUD-REQ-007");
        progress(export, "S9", true);

        WorkItem gst = create("lakshmi.qa", WorkItem.Type.SR, WorkItem.SrKind.DEFECT, null, "Vendor GSTIN validation rejects valid numbers with Z in position 14", "AUD",
            List.of("WEB"), "HIGHEST", "P1", 3, sp[0].id, "Regex treats position 14 as a digit; blocks asset capitalisation for 12 vendors.");
        req(gst, "AUD-REQ-011");
        bug(gst, 4170, "GSTIN validation rejects valid numbers", "RESOLVED", "critical");
        progress(gst, "S9", true);
        gst = itemRepo.findByKey(gst.key).orElseThrow();
        gst.missedGate = "G6"; gst.bugs.get(0).resolution = "FIXED";
        itemRepo.save(gst);

        WorkItem code128 = create("ravi.ba", WorkItem.Type.CR, null, "MINOR", "Add Code128 barcode format to label printing", "LBL",
            List.of("INTERNAL"), "MEDIUM", null, 3, sp[1].id, "Warehouse scanners at two sites read Code128 only.");
        req(code128, "LBL-REQ-018");
        progress(code128, "S7", true);
        WorkItem c128 = code128;
        Waiver wv = as("suresh.rm", () -> {
            Waiver w = new Waiver();
            w.workItemKey = c128.key; w.stageId = "S8"; w.conditions = List.of("CI_CHECKS"); w.risk = "LOW";
            w.reason = "RTM link job is being migrated to the new Jenkins agent this week; links were verified manually for this CR.";
            w.compensatingControls = "QA lead verified the RTM row by hand; job re-run is scheduled after migration.";
            w.expiry = LocalDate.now().plusDays(5);
            return waivers.request(w, fas.id);
        });
        as("anita.arch", () -> waivers.decide(wv.id, true, "Accepted for this release only."));
        checkSome(code128, "S8", "suresh.rm", 2);

        WorkItem transfer = create("ravi.ba", WorkItem.Type.NF, null, null, "Bulk asset transfer between locations with approval", "FAM",
            List.of("WEB", "API"), "HIGH", null, 8, sp[1].id, "Move up to 500 assets between plants in one request with a two-step approval.");
        req(transfer, "FAM-REQ-102");
        progress(transfer, "S0", true);
        checkSome(transfer, "S1", "ravi.ba", 2);

        WorkItem offline = create("ravi.ba", WorkItem.Type.NF, null, null, "Offline mode for mobile verification with later sync", "LBL",
            List.of("MOBILE"), "MEDIUM", null, 13, sp[2].id, "Auditors in basements and remote sites lose connectivity; queue scans and sync later.");
        req(offline, "LBL-REQ-040");
        progress(offline, "S1", true);
        completeAndSubmit(offline, "S2");
        as("ravi.ba", () -> gates.decide(itemRepo.findByKey(offline.key).orElseThrow(), "S2", "REJECTED",
            "Conflict-resolution rule for an asset scanned offline on two devices is missing from the SFVD.", null));
        upload(offline, "S2", "T02", "tara.tw", "Added conflict-resolution section 4.3", false);
        completeAndSubmit(offline, "S2");

        WorkItem label = create("vikram.qe", WorkItem.Type.SR, WorkItem.SrKind.DEFECT, null, "Label preview truncates asset names longer than 40 characters", "LBL",
            List.of("INTERNAL"), "LOW", "P3", 2, null, "Preview cuts names; printed label is correct.");
        move(label, Column.INTAKE, "ravi.ba");
        checkSome(label, "S0", "ravi.ba", 1);

        create("priya.po", WorkItem.Type.NF, null, null, "Depreciation forecast dashboard for the next 5 years", "DEP", List.of("WEB"), "MEDIUM", null, 8, null,
            "Finance wants a forecast by asset class and method.");
        create("priya.po", WorkItem.Type.CR, null, "MAJOR", "Impairment adjustment workflow (Ind AS 36)", "DEP", List.of("WEB", "API"), "HIGH", null, 13, null,
            "Record impairment loss and adjust future depreciation.");
        create("ravi.ba", WorkItem.Type.SR, WorkItem.SrKind.SERVICE, null, "Bulk upload of 1,200 legacy assets from the Pune plant", "PLT", List.of("INTERNAL"), "MEDIUM", null, 3, null,
            "One-time data load with validation report.");

        as("vikram.qe", () -> {
            Waiver w = new Waiver();
            w.workItemKey = rfid.key; w.stageId = "S4"; w.conditions = List.of("CI_CHECKS"); w.risk = "MEDIUM";
            w.reason = "Coverage on the native RFID bridge cannot be measured by JaCoCo; device tests cover it on the hardware lab rig.";
            w.compensatingControls = "Hardware lab test report attached to T07; reviewer to inspect bridge code line by line.";
            w.expiry = LocalDate.now().plusDays(20);
            return waivers.request(w, fas.id);
        });

        backdate();
        snapshotBurndown(sp[1]);
    }

    // ---- stage driving ---------------------------------------------------------------------------------------

    /** Passes every applicable stage up to and including lastStage, moving the card as columns complete. */
    private void progress(WorkItem w, String lastStage, boolean aiOnDocs) {
        move(w, Column.INTAKE, "ravi.ba");
        for (StageDef d : orderedStages()) {
            WorkItem cur = reload(w);
            StageState st = cur.stage(d.id());
            if (st.status == Status.SKIPPED || st.status == Status.APPROVED) { if (d.id().equals(lastStage)) break; continue; }
            Column col = Column.valueOf(d.boardColumn());
            if (cur.column.ordinal() < col.ordinal() && board.missingFor(cur, col).isEmpty()) move(cur, col, "nandini.dm");
            if (aiOnDocs && Set.of("S2", "S6").contains(d.id())) aiDeclare(cur, d.id(), d.id().equals("S2") ? "tara.tw" : "vikram.qe", 0);
            pass(cur, d.id());
            if (d.id().equals(lastStage)) break;
        }
        WorkItem cur = reload(w);
        for (Column c : Column.values()) {
            if (c.ordinal() <= cur.column.ordinal()) continue;
            if (board.missingFor(cur, c).isEmpty()) { move(cur, c, "nandini.dm"); cur = reload(w); } else break;
        }
    }

    private List<StageDef> orderedStages() {
        Map<String, StageDef> byId = new LinkedHashMap<>();
        process.stages().forEach(s -> byId.put(s.id(), s));
        List<StageDef> out = new ArrayList<>();
        for (String id : List.of("S0", "S1", "S2", "S3", "S6", "S4", "S5", "S7", "S8", "S9")) out.add(byId.get(id));
        return out;
    }

    private void pass(WorkItem w, String stageId) {
        completeAndSubmit(w, stageId);
        StageDef d = process.stage(stageId);
        String approver = approverFor(reload(w), d);
        as(approver, () -> gates.decide(reload(w), stageId, "APPROVED", "Reviewed against the " + d.gate() + " checklist.", null));
    }

    private void submitOnly(WorkItem w, String stageId) { completeAndSubmit(w, stageId); }

    private void completeAndSubmit(WorkItem w, String stageId) {
        StageDef d = process.stage(stageId);
        String owner = holder.get(Role.valueOf(d.responsibleRole()));
        WorkItem cur = reload(w);
        if (cur.stage(stageId).status == Status.NOT_STARTED) as(owner, () -> workItems.startStage(w.key, stageId));
        for (String t : process.requiredDocs(cur.workTypeKey(), stageId)) {
            boolean have = documents.forStage(cur.id, stageId).stream().anyMatch(x -> t.equals(x.templateId) && x.baselined);
            if (!have) upload(cur, stageId, t, owner, "First complete draft", true);
        }
        if ("AI_G".equals(reload(w).stage(stageId).aiUsage) && documents.forStage(cur.id, stageId).stream().noneMatch(x -> "T11".equals(x.templateId))) {
            upload(cur, stageId, "T11", owner, "Prompt, model, context pack and assumptions log", false);
        }
        if ("S4".equals(stageId) && reload(w).pullRequests.isEmpty()) {
            pushCommits(cur, "dev.arjun", "feature/" + cur.key, cur.key + " " + String.join(" ", cur.requirementIds) + " implement " + cur.title.toLowerCase());
            openPr(cur, "dev.arjun");
        }
        if ("S5".equals(stageId)) mergePr(cur);
        if (d.requiredCiChecks() != null && !d.requiredCiChecks().isEmpty()) {
            List<CiPayload.TestResult> tests = "S7".equals(stageId) || "S9".equals(stageId)
                ? reload(w).requirementIds.stream().map(r -> new CiPayload.TestResult(r, "TC-" + r.replace("-REQ-", "-") + "-01", "PASS")).toList() : List.of();
            ciBuild(cur, "SUCCESS", allPass(stageId), Map.of("manual", 4, "automated", 18, "deferred", 1, "approved", 23), tests);
        }
        WorkItem now = reload(w);
        StageState st = now.stage(stageId);
        for (WorkItem.CheckItem c : st.checklist) if (!c.checked) as(owner, () -> workItems.check(w.key, stageId, c.index, true, null));
        as(owner, () -> gates.submit(reload(w), stageId));
    }

    private String approverFor(WorkItem w, StageDef d) {
        String a = holder.get(Role.valueOf(d.accountableRole()));
        String op = w.stage(d.id()).aiOperator;
        return a.equals(op) ? "admin" : a;
    }

    private Map<String, String> allPass(String stageId) {
        Map<String, String> m = new LinkedHashMap<>();
        for (String c : process.stage(stageId).requiredCiChecks()) if (!"PARITY".equals(c)) m.put(c, "PASS");
        return m;
    }

    private void checkSome(WorkItem w, String stageId, String user, int n) {
        WorkItem cur = reload(w);
        if (cur.stage(stageId).status == Status.NOT_STARTED) as(user, () -> workItems.startStage(w.key, stageId));
        List<WorkItem.CheckItem> items = reload(w).stage(stageId).checklist;
        for (int i = 0; i < Math.min(n, items.size()); i++) { int idx = items.get(i).index; as(user, () -> workItems.check(w.key, stageId, idx, true, null)); }
    }

    private void aiDeclare(WorkItem w, String stageId, String operator, int unresolved) {
        as(operator, () -> workItems.setAiUsage(w.key, stageId, "AI_G", operator, unresolved));
    }

    private void upload(WorkItem w, String stageId, String templateId, String user, String comment, boolean baseline) {
        byte[] bytes = templateBytes(templateId);
        String file = process.templateFile(templateId).replaceFirst("^T\\d\\d", templateId + "-" + w.key);
        DocumentRecord d = as(user, () -> documents.upload(reload(w), stageId, templateId, null, DocumentRecord.Direction.OUTPUT, "v0.1 draft",
            file, contentType(file), bytes));
        if (baseline) {
            as(user, () -> documents.upload(reload(w), stageId, templateId, null, DocumentRecord.Direction.OUTPUT, comment, file, contentType(file), bytes));
            as(user, () -> documents.baseline(d.id, null));
        }
    }

    private byte[] templateBytes(String id) {
        try {
            return new ClassPathResource("templates/" + process.templateFile(id)).getContentAsByteArray();
        } catch (IOException e) {
            return ("Demo content for " + id).getBytes(StandardCharsets.UTF_8);
        }
    }

    private static String contentType(String f) {
        return f.endsWith(".xlsx") ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }

    // ---- Git and CI through the real webhooks ----------------------------------------------------------------

    private void pushCommits(WorkItem w, String author, String branch, String... messages) {
        List<Map<String, Object>> commits = new ArrayList<>();
        for (String m : messages) {
            String sha = sha(w.key + m);
            commits.add(Map.of("id", sha, "message", m, "timestamp", Instant.now().toString(), "url", fas.integrations.git.repoUrl + "/commit/" + sha,
                "author", Map.of("name", author)));
        }
        webhook("push", Map.of("ref", "refs/heads/" + branch, "commits", commits));
    }

    private void openPr(WorkItem w, String author) {
        int n = ++prNumber;
        String branch = (w.type == WorkItem.Type.SR ? "bugfix/" : "feature/") + w.key;
        webhook("pull_request", Map.of("action", "opened", "pull_request", Map.of("number", n, "title", w.key + " " + w.title, "state", "open", "merged", false,
            "html_url", fas.integrations.git.repoUrl + "/pull/" + n, "head", Map.of("ref", branch), "base", Map.of("ref", "main"), "user", Map.of("login", author))));
    }

    private void mergePr(WorkItem w) {
        for (WorkItem.PullRequestRef pr : reload(w).pullRequests) {
            webhook("pull_request", Map.of("action", "closed", "pull_request", Map.of("number", Integer.parseInt(pr.number), "title", pr.title, "state", "closed", "merged", true,
                "html_url", pr.url, "head", Map.of("ref", pr.sourceBranch), "base", Map.of("ref", "main"), "user", Map.of("login", pr.author))));
        }
    }

    private void webhook(String event, Map<String, Object> payload) {
        String body = json.writeValueAsString(payload);
        Map<String, String> h = new java.util.TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        h.put("x-github-event", event);
        h.put("x-hub-signature-256", "sha256=" + GitWebhookService.hmac(GIT_SECRET, body));
        git.handle(fas.key, h, body);
    }

    private void ciBuild(WorkItem w, String status, Map<String, String> checks, Map<String, Integer> parity, List<CiPayload.TestResult> tests) {
        WorkItem cur = reload(w);
        String commit = cur.commits.isEmpty() ? null : cur.commits.get(cur.commits.size() - 1).sha;
        long n = ++build;
        ci.receive(fas.key, CI_TOKEN, new CiPayload("fas-pipeline", n, status, fas.integrations.ci.url + "/job/fas-pipeline/" + n + "/", null, commit, cur.key,
            checks, tests, parity, fas.currentRelease));
    }

    private static String sha(String s) {
        try {
            byte[] d = java.security.MessageDigest.getInstance("SHA-1").digest(s.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(d);
        } catch (Exception e) { throw new IllegalStateException(e); }
    }

    // ---- reference data ----------------------------------------------------------------------------------------

    private void seedUsers() {
        Object[][] people = {
            {"admin", "System Administrator", EnumSet.of(Role.ADMIN)},
            {"priya.po", "Priya Raman", EnumSet.of(Role.PRODUCT_OWNER)},
            {"ravi.ba", "Ravi Kumar", EnumSet.of(Role.BUSINESS_ANALYST)},
            {"tara.tw", "Tara Joseph", EnumSet.of(Role.TECH_WRITER)},
            {"anita.arch", "Anita Desai", EnumSet.of(Role.ARCHITECT, Role.COUNCIL)},
            {"kiran.tl", "Kiran Rao", EnumSet.of(Role.TECH_LEAD)},
            {"dev.arjun", "Arjun Menon", EnumSet.of(Role.DEVELOPER)},
            {"dev.meera", "Meera Iyer", EnumSet.of(Role.DEVELOPER)},
            {"sanjay.rev", "Sanjay Gupta", EnumSet.of(Role.REVIEWER, Role.DEVELOPER)},
            {"lakshmi.qa", "Lakshmi Nair", EnumSet.of(Role.QA_LEAD)},
            {"vikram.qe", "Vikram Shah", EnumSet.of(Role.QA_ENGINEER, Role.AUTOMATION_ENGINEER)},
            {"farah.sme", "Farah Khan", EnumSet.of(Role.DOMAIN_SME)},
            {"suresh.rm", "Suresh Pillai", EnumSet.of(Role.RELEASE_MANAGER)},
            {"deepa.ops", "Deepa Reddy", EnumSet.of(Role.DEVOPS)},
            {"omar.sec", "Omar Siddiqui", EnumSet.of(Role.SECURITY)},
            {"nandini.dm", "Nandini Bose", EnumSet.of(Role.DELIVERY_MANAGER)},
        };
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("system", null, List.of()));
        for (Object[] p : people) {
            @SuppressWarnings("unchecked") Set<Role> roles = (Set<Role>) p[2];
            User u = users.create((String) p[0], (String) p[1], p[0] + "@example.com", DEMO_PASSWORD, roles);
            for (Role r : roles) holder.putIfAbsent(r, u.username);
        }
    }

    private static Project simpleProject(String key, String name, String desc) {
        Project p = new Project();
        p.key = key; p.name = name; p.description = desc;
        p.modules = new ArrayList<>(List.of("LBL", "PLT")); p.surfaces = new ArrayList<>(List.of("MOBILE"));
        return p;
    }

    private void seedRequirements() {
        String[][] reqs = {
            {"FAM-REQ-101", "Register a new asset with class, location and cost centre", "FAM", "WEB", "MUST", "DONE"},
            {"FAM-REQ-102", "Transfer assets between locations with approval", "FAM", "WEB", "MUST", "APPROVED"},
            {"DEP-REQ-214", "Pro-rate WDV depreciation by days in service", "DEP", "API", "MUST", "IN_PROGRESS"},
            {"DEP-REQ-215", "Show pro-rata calculation breakdown on the asset ledger", "DEP", "WEB", "SHOULD", "IN_PROGRESS"},
            {"LBL-REQ-018", "Print labels in Code128 format", "LBL", "INTERNAL", "SHOULD", "IN_PROGRESS"},
            {"LBL-REQ-031", "Read RFID tags from the mobile app", "LBL", "MOBILE", "MUST", "IN_PROGRESS"},
            {"LBL-REQ-032", "Match a scanned tag to the asset register and record verification", "LBL", "MOBILE", "MUST", "IN_PROGRESS"},
            {"LBL-REQ-040", "Queue verifications offline and sync later", "LBL", "MOBILE", "SHOULD", "APPROVED"},
            {"AUD-REQ-007", "Export an asset's audit trail to CSV by period", "AUD", "WEB", "MUST", "DONE"},
            {"AUD-REQ-011", "Validate vendor GSTIN format", "AUD", "WEB", "MUST", "DONE"},
        };
        as("ravi.ba", () -> {
            for (String[] r : reqs) {
                Requirement q = new Requirement();
                q.reqId = r[0]; q.title = r[1]; q.module = r[2]; q.surface = r[3]; q.priority = r[4]; q.status = r[5]; q.revision = "r1";
                q.sfvdRef = "T02 §" + (3 + r[0].hashCode() % 4 + 4) % 7;
                trace.save(fas.id, q);
            }
            return null;
        });
    }

    private Sprint[] seedSprints() {
        LocalDate today = LocalDate.now();
        return as("nandini.dm", () -> {
            Sprint s14 = sprints.create(fas.id, sprint("Sprint 14", "Close out audit export and GSTIN defect", today.minusDays(20), today.minusDays(7), 34));
            Sprint s15 = sprints.create(fas.id, sprint("Sprint 15", "RFID verification and daily pro-rata WDV into test", today.minusDays(6), today.plusDays(7), 40));
            Sprint s16 = sprints.create(fas.id, sprint("Sprint 16", "Offline mobile verification", today.plusDays(8), today.plusDays(21), 40));
            sprints.start(s14.id);
            return new Sprint[] {s14, s15, s16};
        });
    }

    private static Sprint sprint(String name, String goal, LocalDate start, LocalDate end, int cap) {
        Sprint s = new Sprint();
        s.name = name; s.goal = goal; s.start = start; s.end = end; s.capacity = cap;
        return s;
    }

    private WorkItem create(String user, WorkItem.Type type, WorkItem.SrKind kind, String crClass, String title, String module, List<String> surfaces,
                            String priority, String severity, Integer points, String sprintId, String description) {
        return as(user, () -> workItems.create(fas.id, new WorkItemService.CreateWorkItem(type, kind, title, description, module, surfaces, priority, severity, crClass,
            holder.get(type == WorkItem.Type.SR ? Role.DEVELOPER : Role.BUSINESS_ANALYST), points, sprintId, List.of())));
    }

    private void req(WorkItem w, String... ids) { for (String id : ids) as("ravi.ba", () -> workItems.linkRequirement(w.key, id, true)); }

    private void bug(WorkItem w, long id, String summary, String status, String severity) {
        WorkItem cur = reload(w);
        WorkItem.BugRef b = new WorkItem.BugRef();
        b.id = id; b.summary = summary; b.status = status; b.severity = severity; b.syncedAt = Instant.now();
        b.url = fas.integrations.bugzilla.baseUrl + "/show_bug.cgi?id=" + id;
        cur.bugs.add(b);
        itemRepo.save(cur);
    }

    private void move(WorkItem w, Column c, String user) { as(user, () -> board.move(w.key, c, null, null)); }

    private WorkItem reload(WorkItem w) { return itemRepo.findByKey(w.key).orElseThrow(); }

    // ---- make the history look like weeks of work ------------------------------------------------------------

    private void backdate() {
        Instant now = Instant.now();
        List<WorkItem> all = itemRepo.findByProjectId(fas.id);
        int i = 0;
        for (WorkItem w : all) {
            long started = w.stages.values().stream().filter(s -> s.startedAt != null).count();
            int ageDays = 2 + (int) started * 3 + (i++ % 3);
            Instant cursor = now.minus(Duration.ofDays(ageDays));
            w.createdAt = cursor;
            long step = Duration.ofDays(ageDays).toMinutes() / Math.max(1, started + 1);
            for (StageDef d : orderedStages()) {
                StageState s = w.stage(d.id());
                if (s.startedAt == null) continue;
                s.startedAt = cursor;
                if (s.submittedAt != null) s.submittedAt = cursor.plus(Duration.ofMinutes(step * 3 / 4));
                if (s.approvedAt != null) {
                    s.approvedAt = cursor.plus(Duration.ofMinutes(step));
                    for (WorkItem.GateDecision g : s.history) g.at = "SUBMITTED".equals(g.decision) ? s.submittedAt : s.approvedAt;
                    cursor = s.approvedAt;
                }
            }
            if (w.closedAt != null) w.closedAt = w.stage("S9").approvedAt;
            for (WorkItem.BuildRef b : w.builds) if (b.at != null && b.at.isBefore(w.createdAt)) b.at = w.createdAt;
            itemRepo.save(w);
        }
    }

    private void snapshotBurndown(Sprint s) {
        Sprint cur = sprintRepo.findById(s.id).orElseThrow();
        if (cur.status != Sprint.Status.ACTIVE) {
            as("nandini.dm", () -> { sprintRepo.findByProjectIdOrderByStartDesc(fas.id).stream().filter(x -> x.status == Sprint.Status.ACTIVE)
                .forEach(x -> sprints.close(x.id)); return sprints.start(s.id); });
            cur = sprintRepo.findById(s.id).orElseThrow();
        }
        int committed = itemRepo.findBySprintId(s.id).stream().mapToInt(w -> w.storyPoints == null ? 0 : w.storyPoints).sum();
        List<Sprint.BurnPoint> pts = new ArrayList<>();
        int[] done = {0, 0, 2, 2, 5, 5};
        for (int d = 0; d < done.length; d++) pts.add(new Sprint.BurnPoint(cur.start.plusDays(d), committed - done[d], done[d]));
        cur.burndown = pts;
        sprintRepo.save(cur);
    }

    private <T> T as(String username, Supplier<T> fn) {
        User u = userRepo.findByUsername(username).orElseThrow();
        var auth = new UsernamePasswordAuthenticationToken(u.username, null, u.roles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r.name())).toList());
        var ctx = SecurityContextHolder.createEmptyContext();
        ctx.setAuthentication(auth);
        var prev = SecurityContextHolder.getContext();
        SecurityContextHolder.setContext(ctx);
        try { return fn.get(); } finally { SecurityContextHolder.setContext(prev); }
    }
}
