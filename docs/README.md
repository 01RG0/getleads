# Documentation Structure

This folder is organized for fast implementation and code upload mapping.

## Folders

- `docs/features/` — One file per product feature.
- `docs/tools/` — One file per integrated tool.
  - `docs/tools/osint/` — Open-source OSINT tools.
  - `docs/tools/mcp/` — MCP tool contracts for AI agents.
- `docs/*.md` (existing) — Deep technical specs and reference architecture.

## How to Use During Implementation

1. Start from the relevant feature file in `docs/features/`.
2. Check linked technical references.
3. Implement code in the matching feature folder in your codebase.
4. Update the feature/tool doc when behavior or integration changes.

## Suggested Code Upload Mapping

- Feature code: `src/features/<feature-name>/`
- Shared platform code: `src/platform/`
- Tool adapters: `src/tools/<tool-name>/`
- API routes: `src/api/`
- Workers/jobs: `src/workers/`
