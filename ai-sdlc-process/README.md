# AI SDLC Process — definition, templates and implementation kit

Everything needed to run the AI-augmented SDLC on the Fixed Assets suite (web application with
microservices, mobile application, internal web applications).

| Path | What it is |
|---|---|
| `AI-SDLC-Process-Definition.docx` | **PD-AISDLC-01**, the process definition (64 pages, 10 diagrams). Stages S0–S9 with inputs, activities, outputs, the mode of each (manual / AI-generated / AI-assisted / automated / AI not permitted), how AI output is validated, gate checklists, RACI; flows for new feature, change request, issue fix and service request; Context Pack; traceability; governance; templates register; implementation plan; worked examples. |
| `templates/T01…T15-*.docx` | Fillable Word templates, one per artifact. Each has a how-to box, document information, guided sections with example rows, a clickable review checklist, sign-off and revision history. T10 holds all ten gate checklists. |
| `templates/X01-AI-SDLC-Tracker.xlsx` | Tracker workbook: RTM with coverage check, Gate Log (flags reviewer = AI operator), AI Usage Log, Parity, Waivers, Context Pack versions, Defect-to-Gate, live Metrics. |
| `ai-context/` | Context Pack starter: `AI-INSTRUCTIONS.md`, CP-00 to CP-99 with `OWNER TO COMPLETE` blocks, ten stage prompts (`CP-50-prompt-templates/P-S0…P-S9.md`), CP-60 checklists, and the pull request template. Copy to the repository root as `/ai-context`. |
| `presentation/AI-SDLC-Process-Implementation.pptx` | 39-slide briefing that explains the process and how to implement it here (Jira, Git, Jenkins, roles, governance, roll-out, pilot, first 30 days). Speaker notes on every content slide. |
| `diagrams/` | The ten process diagrams as SVG and PNG. |
| `build/` | Generators. `process_data.js` is the single source of truth for stages, checklists, templates and rules. |

## Rebuilding
Edit `build/process_data.js` (or a builder), then run `build/build.sh`. The document, templates,
Context Pack checklists, prompts and deck are regenerated together so they cannot drift apart.
Recalculate the tracker in Excel or LibreOffice before distributing it.

## Assumptions to confirm before approval
- **Tools.** Jira, Jenkins, PMD and Sonar come from the current process. The Git host, test management
  tool and approved AI tools were not specified, so they are described generically; record the real ones in CP-40 and section 10.3.
- **Module prefixes** FAM, DEP, LBL, AUD and PLT are proposed. Confirm or replace them in CP-00 before the first REQ-ID is issued.
- **Thresholds** for coverage and duplication are left to the AI Governance Council.
- **P1/P2 rule.** AI is not permitted for root cause analysis or for P1/P2 fixes; it is allowed for P3/P4 fixes after the RCA is approved.
- **Worked examples** in Appendix A are illustrative, not records of real work.
