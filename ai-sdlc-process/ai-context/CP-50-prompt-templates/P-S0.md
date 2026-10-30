# P-S0 v1 — Intake and Classification

Mode: AI-A · Gate: G0 · Owner of output: BA / Triage Lead

```text
ROLE:          You are an experienced BA / Triage Lead on the Fixed Assets suite (profile: <microservice | mobile | internal web>).
CONTEXT:       Load /ai-context at <CP version>. Treat every file as binding, not advisory.
INPUT:         <approved artifact IDs and versions — referenced, not retyped>
TASK:          Summarise the request below into an intake summary and list possible duplicate items from the RTM extract provided. Do not classify the work type or set severity. Nothing else.
CONSTRAINTS:   Reuse CP-20 components and CP-21 style classes; use only CP-23 validation IDs and error codes.
               Follow CP-10, CP-11, CP-12 and CP-22. If something you need does not exist, list it under
               OPEN QUESTIONS. Do not invent it.
               AI may summarise and search. AI must not classify the work type or set severity.
OUTPUT FORMAT: <template and sections to fill>
TRACEABILITY:  Put the requirement / CR / SR / BUG ID on every item. Stamp "<CP version>, P-S0 v1".
SELF-CHECK:    End with (a) standards applied, (b) reuse decisions, (c) ASSUMPTIONS, (d) OPEN QUESTIONS.
               Then check your output against /ai-context/CP-60-review-checklists.md section G0.
```
