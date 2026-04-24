# concept-viz

Interactive visualization toolkit for OMOP concept exploration and cohort eligibility mapping.

Separated from Broadsea as a self-contained project that can later be extracted via `git subtree split` into its own repository.

## Purpose

Prototype and deliver visual tools that replace keyword-search with guided exploration:

- DOI (Degree-of-Interest) Tree + Semantic Zoom for vocabulary navigation
- Drag / Lasso selection for building concept sets visually
- Feasibility dashboards showing patient counts during exploration
- Clinician-in-the-loop mapping review UI

## Relationship to Broadsea

During development, this folder lives inside the Broadsea repo so it can reach local services:

- `http://localhost/artemis` — mapping agent, KG, ChromaDB
- `http://localhost/WebAPI` — cohort feasibility counts
- `atlasdb` (postgres) — vocabulary tables (`CONCEPT`, `CONCEPT_ANCESTOR`, etc.)

For eventual public sharing, Broadsea data will be exported to static fixtures under `public/data/` so the demos run without any backend.

## Structure

```
concept-viz/
├── index.html                        # landing page (entry point for first-time viewers)
├── docs/                             # proposal, implementation notes, figures
│   ├── proposal_v2_visualization_focus.md
│   ├── implementation_detail.md
│   ├── clinician_in_the_loop_omop_criteria_mapper.md
│   └── figures/
├── demos/                            # standalone HTML prototypes (no build step)
│   ├── demo-tour.html                # guided 8-step walkthrough of all demos
│   └── demo-*.html                   # individual technique demos
├── public/
│   ├── visual-abstract.svg           # reusable pipeline diagram (for slides/docs)
│   └── data/                         # (future) exported fixtures
├── src/                              # (future) shared JS/CSS used across demos
└── scripts/                          # (future) fixture export scripts
```

## Entry Points

For different audiences:

- **First-time viewer** → start at `index.html`
- **Want to understand project in 10 min** → `demos/demo-tour.html` (8-step guided tour)
- **Want the full argument** → `docs/proposal_v2_visualization_focus.md`
- **Just want the core demo** → `demos/demo-integrated.html`
- **Need a diagram for slides / external docs** → `public/visual-abstract.svg`

## Existing Demos

All previously built prototypes now live under `demos/`:

| File | Technique |
|------|-----------|
| `demo-integrated.html` | Tree + Funnel live update (core demo) |
| `demo-all.html` | 4 demos in tabbed view |
| `demo.html` | 4-panel integrated (Criteria + Cards + Graph + Dashboard) |
| `demo-focus-context.html` | DOI Tree + Semantic Zoom |
| `demo-interactive-select.html` | Drag / lasso selection |
| `demo-space-filling.html` | Treemap / Sunburst |
| `demo-mapping-review.html` | Anchor-based hierarchy for mapping review |
| `demo-feasibility.html` | Threshold slider + attrition waterfall |
| `demo-child-histogram.html` | OMOP child count distribution |

These are linked from `docs/proposal_v2_visualization_focus.md` (relative path `../demos/*`).

## Development

No build toolchain yet. Open HTML files directly in a browser, or serve the folder:

```bash
cd concept-viz
python3 -m http.server 8000
# open http://localhost:8000/demos/
```

## Roadmap

1. **Stage 1** — Fixture export pipeline (`scripts/export_fixtures.py` in Broadsea)
2. **Stage 2** — Rebuild demos against fixtures under `public/data/`
3. **Stage 3** — Extract to standalone repo via `git subtree split --prefix=concept-viz`
