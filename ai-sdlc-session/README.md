# AI-Augmented SDLC Framework — team session

Deck for a 30–45 minute enablement session on how the Fixed Assets suite
(web + microservices, mobile, internal web apps) uses AI across the SDLC, and
how every AI output is verified by manual review before it becomes the next
stage's input.

## Files

| File | What it is |
|---|---|
| `AI-SDLC-Framework-Session.pptx` | The deck — 40 slides, speaker notes on every content slide |
| `AI-SDLC-Framework-Session.pdf` | Same deck as a handout |
| `build_deck.js` | Generator. Edit this, not the .pptx, so the deck stays reproducible |

## Rebuilding after an edit

```bash
npm install                      # first time only
NODE_PATH=$PWD/node_modules node build_deck.js
```

## Structure (sections map to the agenda)

1. Opening — title, agenda with timings
2. Where we stand — the manual process, and the six gaps AI opened
3. Pros, cons and the control for each — including the risk-to-control table
4. The framework — nine stages, and the five-step pattern every stage repeats
5. Common context layer — the Context Pack, surface profiles, standard prompt
6. Stage by stage — inputs to AI, AI output, manual review, exit gate, roles
7. Verification and governance — traceability chain, four verification levels,
   automated gates, RACI, governance model, metrics
8. Rollout and decisions — 30/60/90 plan, do and do-not card, the four
   decisions the session needs to close on

Slide numbers 19–27 are the nine stage slides; they share one layout so the
pattern is recognisable, with a progress rail showing the current stage.
