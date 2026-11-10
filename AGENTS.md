# 4D Mölkky LLM Wiki Instructions

This repository is a persistent LLM-maintained wiki for researching and designing a VR 4D Mölkky game.

## Purpose

Build a practical knowledge base that helps answer:

- How should Mölkky rules, throwing, scoring, and pin layout translate into four spatial dimensions?
- How should the project's own web engine in `game/` grow: physics, rendering, interaction, and a WebXR path to VR?
- What can still be learned from HackerPoet's Engine4D, the previous engine?
- What should the first playable prototype contain?

## Structure

- `raw/sources/` contains source records and clipped source material. Treat these as immutable evidence.
- `wiki/` contains LLM-generated synthesis and design notes. The LLM may create and edit these files.
- `wiki/index.md` is the content map. Update it whenever wiki pages are added or materially changed.
- `wiki/log.md` is append-only. Add a dated entry for each ingest, query, lint pass, or design update.
- `wiki/sources/` contains one page per source, summarizing what matters for this project.
- `wiki/concepts/` contains durable topic pages.
- `wiki/design/` contains evolving product, gameplay, and prototype decisions.
- `wiki/questions/` contains open research questions and investigation plans.

## Source Discipline

When ingesting a source:

1. Add or update a source record under `raw/sources/`.
2. Create a source summary under `wiki/sources/`.
3. Update relevant concept and design pages.
4. Preserve uncertainty. Mark project-specific extrapolations as `Inference`.
5. Update `wiki/index.md`.
6. Append to `wiki/log.md`.

Do not present a derived claim as a source claim. Engine4D facts should cite the Engine4D source page. Facts about the web game should cite its code, tests, or a recorded run. Mölkky or VR facts should cite their own source pages once added.

## Page Conventions

Use Obsidian-style wiki links for internal pages, for example `[[Engine4D]]` or `[[Prototype Scope]]`.

Every substantive page should include:

- A one-sentence purpose or summary.
- Key points.
- Open questions or risks when relevant.
- Source links, either to source pages or external source URLs.

Prefer short, focused pages over large catch-all documents. If a section starts accumulating unrelated material, split it into a concept, design, or question page and link it from the parent.

## Video Delivery

- Always publish user-facing gameplay videos, comparisons, and slow-motion clips to Vinssi Pages; local file paths alone are not a finished delivery.
- Update the existing playtest page when possible, verify the page and video URLs, and include the shareable link in the final response. See `ops/vinssi-pages.md`.

## Current Assumptions

- The game is the browser build in `game/` (TypeScript, three.js, project 4D physics). See `wiki/design/Web Rebuild.md` and `game/README.md`.
- The Unity and Engine4D prototype under `external/Engine4D` is legacy reference. Do not extend it unless asked.
- Desktop is the tested target. VR remains the long-term goal, through WebXR; it is not built yet.
- The game should retain recognizable Mölkky identity while making the fourth spatial dimension meaningful rather than cosmetic.
