# LLM Wiki Method

This wiki follows Karpathy's LLM-maintained knowledge base pattern: raw sources, generated wiki, and a governing schema.

## Source

- Gist: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- Source record: `raw/sources/llm-wiki-gist.md`
- Accessed: 2026-04-30

## Key Points

- Raw sources are immutable and act as source of truth.
- The wiki is a structured, interlinked markdown layer generated and maintained by the LLM.
- The schema or agent instruction file tells the LLM how to ingest, query, lint, and maintain the wiki.
- `index.md` is content-oriented and helps navigation.
- `log.md` is chronological and records ingests, queries, lint passes, and major changes.
- Answers to important questions can become new wiki pages, so exploration accumulates instead of disappearing into chat history.

## Local Adaptation

This repository uses `AGENTS.md` as the schema. The generated knowledge lives under `wiki/`, while source records live under `raw/sources/`.

