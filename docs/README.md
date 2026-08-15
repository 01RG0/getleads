# LeadScale Documentation

Master index for all technical, business, and integration documentation.

---

## Folder Structure

| Folder | Purpose |
|--------|---------|
| `architecture/` | System design, data flow, database schema, API spec, and infra |
| `integrations/` | All external tool catalogs — AI APIs, OSINT tools, enrichment APIs, CRM/MCP |
| `business/` | Market analysis, pricing model, roadmap, and risk register |
| `engineering/` | Operational patterns — error handling, fallbacks, server management |
| `design/` | UI tokens, color palette, and design system reference |
| `features/` | One spec file per product feature |
| `tools/mcp/` | MCP tool contracts for AI agent endpoints |
| `tools/osint/` | Individual OSINT tool integration cards |

---

## Quick Navigation

### Engineering
| File | Description |
|------|-------------|
| `architecture/overview.md` | High-level system architecture — services, data flow, component map |
| `architecture/data_pipeline.md` | Waterfall enrichment pipeline — stage-by-stage technical spec |
| `architecture/api_design.md` | REST API endpoint contracts (OpenAPI 3.1) |
| `architecture/database_schema.md` | PostgreSQL schema — all tables, indexes, and relationships |
| `architecture/infrastructure.md` | Docker Compose, container fleet, Redis, worker topology |
| `engineering/server_management_error_handling_and_fallbacks.md` | Error handling patterns, circuit breakers, retry logic, fallback chains |

### Integrations & Tools
| File | Description |
|------|-------------|
| `integrations/crm_and_mcp.md` | HubSpot/Salesforce CRM connectors and MCP server protocol spec |
| `integrations/free_ai_apis_and_llm_router.md` | 25+ free AI/LLM API providers and multi-LLM gateway router architecture |
| `integrations/lead_search_and_verification_apis.md` | Hosted APIs for lead search, email discovery, verification, phone, firmographic, proxy |
| `integrations/opensource_leadgen_and_osint_tools.md` | Open-source GitHub tools for scraping, OSINT, email enumeration, and phone lookup |
| `tools/mcp/` | MCP tool contracts: `search_leads`, `enrich_contact`, `verify_deliverability`, `create_campaign` |
| `tools/osint/` | OSINT tool cards: crawl4ai, holehe, GHunt, phoneinfoga, sherlock, crosslinked |

### Business
| File | Description |
|------|-------------|
| `business/market_and_unit_economics.md` | TAM/SAM/SOM analysis, unit economics, LTV/CAC model, pricing rationale |
| `business/roadmap_and_risk.md` | Phase 1–3 product roadmap, risk register, and mitigation strategies |

### Design
| File | Description |
|------|-------------|
| `design/color-palette.md` | Brand color tokens, light/dark palette variables, and usage guidelines |

### Feature Specs (`features/`)
| File | Description |
|------|-------------|
| `features/agency-multi-tenancy.md` | Parent/child workspace hierarchy, credit pooling, permission roles |
| `features/data-pipeline-waterfall-enrichment.md` | Waterfall enrichment feature spec and cascade logic |
| `features/email-verification-engine.md` | 3-stage verification engine: syntax → SMTP → catch-all |
| `features/mcp-server-integration.md` | MCP server feature spec for AI agent tool endpoints |
| `features/multi-llm-gateway-router.md` | AI gateway router feature spec |
| `features/osint-worker-fleet.md` | Containerized OSINT worker fleet feature spec |
| `features/server-management-fallbacks.md` | Server management and fallback feature spec |

---

## How to Use During Implementation

1. Start from the relevant feature file in `docs/features/`.
2. Check linked technical references in `docs/architecture/`.
3. For external tool integration, check `docs/integrations/` and `docs/tools/`.
4. Implement code in the matching feature folder in your codebase.
5. Update the feature/tool doc when behavior or integration changes.

## Suggested Code Upload Mapping

- Feature code: `src/features/<feature-name>/`
- Shared platform code: `src/platform/`
- Tool adapters: `src/tools/<tool-name>/`
- API routes: `src/api/`
- Workers/jobs: `src/workers/`
