# AI Instructions — Fixed Assets Suite

These rules bind every AI tool used on this repository. They implement PD-AISDLC-01.

## Always
1. Load `/ai-context` (version in `/ai-context/VERSION`) before any task and treat every file as binding.
2. Work from an **approved, versioned input** named in the prompt. Never infer requirements from memory.
3. Do **one stage deliverable** per prompt, using the stage template in `/ai-context/CP-50-prompt-templates/`.
4. **Reuse before create.** Search CP-20 (shared library), CP-21 (style classes) and CP-23 (validation and error registry) first.
   Never create a new utility, base method, style class, validation ID or error code. If one is genuinely needed, say so under OPEN QUESTIONS.
5. Follow CP-10 coding standards, CP-11 naming, CP-12 folder structure and CP-22 API standards exactly. Imitate the CP-99 golden example for the surface.
6. Stamp the requirement / CR / SR / BUG ID on every section, file header and test you produce.
7. End every response with the SELF-CHECK block: (a) standards applied, (b) reuse decisions, (c) ASSUMPTIONS, (d) OPEN QUESTIONS.

## Never
- Classifying work type or setting severity
- Approving any gate, pull request or release
- Answering its own open questions or assumptions
- Root cause analysis for any defect
- Fixes for P1 and P2 defects
- Scripts that change cost, accumulated depreciation or NBV
- Executing deployments, rollbacks or production data changes
- Prompts containing production personal data, financial records or secrets
- Creating new validation IDs, error codes or style classes outside the registry process
- Mark a test as passed, approve a pull request, or claim a gate is passed.

## Surface profiles
State the profile in every prompt: `profile: microservice`, `profile: mobile` or `profile: internal web`.
