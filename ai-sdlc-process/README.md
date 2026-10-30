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
| `site/` | **The AI SDLC Process Portal**: the whole process as navigable web pages, with every document and template viewable online and downloadable from the stage where it is used. Open `site/index.html`. |
| `diagrams/` | The ten process diagrams as SVG and PNG. |
| `build/` | Generators. `process_data.js` is the single source of truth for stages, checklists, templates and rules. |

## The web portal (`site/`)
A self-contained static site: no server code, no database, and nothing for the people using it to install.

- **Navigation:** a sidebar that follows the process (start, process, ten stages, three work-type flows, assurance,
  context, people, documents, templates, roll-out); breadcrumbs; previous/next on every page; an on-page index;
  clickable stage boxes on the diagrams.
- **Help and tooltips:** a help dialog (`?` key), a How-to page, and tooltips on every mode tag, gate, template,
  stage, Context Pack file and validation technique code. Those codes are also links.
- **Search:** finds stages, templates, roles and terms (`/` key).
- **View or download:** every stage page lists its documents with *View* (read-only web view) and *Download*.
  The document library filters all documents by stage and work type. The deck has a slide viewer.
- **Working aids:** stage checklists you can tick (saved in your own browser only, not a gate record), activity
  filters for manual versus AI steps, copy buttons for the stage prompts and ID formats, light and dark themes.

**Hosting.** Copy the `site/` folder to any static web host: IIS, nginx or Apache, internal Git pages, or a shared
drive (opening `index.html` directly also works). SharePoint document libraries usually download `.html` files
instead of showing them, so use a web server or site-pages location there. Fonts come from Google Fonts when
reachable and fall back to Cambria, Calibri and Consolas otherwise. Rebuild with `node build/build_site2.js`
after any change; `node build/build_site2.js --preview <dir>` produces the copy published on claude.ai, where
downloads are switched off because claude.ai blocks file downloads.

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
