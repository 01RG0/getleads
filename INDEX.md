# LeadScale Project Plan & Documentation Index

This repository contains the complete, buildable project plan, product requirements, technical design docs, database schemas, diagrams, market research, unit economics, free AI API catalog, open-source OSINT tool integration specs, server management & error fallback standards, and 90-day roadmap for **LeadScale** — the Next-Gen B2B Lead Generation and Waterfall Enrichment Platform.

---

## Document Navigation Index

0. **[Documentation Structure Guide](./docs/README.md)**  
   Entry point for folder organization, feature docs, tool docs, and suggested code upload mapping.

1. **[Product Requirements Document (PRD)](./PRD.md)**  
   Contains problem statement, target user personas, Jobs-To-Be-Done (JTBD), MVP scope vs v2/v3, functional requirements, non-functional requirements (NFRs), and success KPIs.

2. **Implementation-Ready Documentation Buckets:**
   * **[Feature Docs Index](./docs/features/README.md):** One file per product feature with linked specs and target code folders.
   * **[Tool Docs Index](./docs/tools/README.md):** One file per integrated tool (OSINT + MCP tools) with integration contract placeholders.

3. **Technical Specs & Architecture:**
   * **[System Architecture & Tech Stack](./docs/architecture.md):** Decoupled micro-monolith specs, Next.js / Fastify / Go / Python components, AI Gateway, security, and scaling strategy.
   * **[Data Pipeline & Verification Engine](./docs/data_pipeline.md):** 5-stage streaming pipeline, 3-stage live SMTP verification, OSINT checks, deduplication rules, and 14-day freshness TTL logic.
   * **[Server Management, Error Handling & Fallbacks](./docs/server_management_error_handling_and_fallbacks.md):** **[NEW]** HTTP request lifecycle, process clustering, RFC 7807 problem details error format, circuit breaker state machines, multi-tier fallbacks, BullMQ queue retries, and Dead-Letter Queue (DLQ).
   * **[Free AI APIs Catalog & Multi-LLM Router Engine](./docs/free_ai_apis_and_llm_router.md):** Complete directory of 15+ Free AI APIs (Groq, Gemini Flash, OpenRouter, Cerebras, DeepSeek), AI Gateway Router architecture, and admin provider management schemas.
   * **[Open-Source LeadGen & OSINT Tools Analysis](./docs/opensource_leadgen_and_osint_tools.md):** In-depth analysis and integration blueprint for top GitHub OSINT and leadgen repos (`crawl4ai`, `holehe`, `phoneinfoga`, `Crosslinked`, `GHunt`, `sherlock`).
   * **[API Design & OpenAPI Spec](./docs/api_design.md):** RESTful endpoints (`/contacts/search`, `/enrich/person`, `/verify/email`, `/admin/ai-providers`), JSON schemas, rate limits, and webhooks.
   * **[Integrations & MCP Server Protocol Spec](./docs/integrations.md):** Native CRM sync (HubSpot/Salesforce) and complete Model Context Protocol (MCP) server tool definitions for AI agents.
   * **[Infrastructure & Hosting Plan](./docs/infrastructure.md):** AWS EKS, Aurora PostgreSQL, ClickHouse, Dockerized worker pods, residential proxy pool rotation, and cloud cost breakdown.

4. **Database Schema & Data Model:**
   * **[Database Architecture & ERD](./docs/database_schema.md):** Entity relationship diagrams, multi-tenant workspace hierarchy, `ai_providers` registry tables, and field documentation.
   * **[PostgreSQL DDL Script (`schema.sql`)](./schema.sql):** Executable SQL DDL script with enums, constraints, composite indexes, `ai_providers` table, and RLS policies.
   * **[Prisma ORM Schema (`schema.prisma`)](./schema.prisma):** Production-ready Prisma ORM schema for Node.js/TypeScript including `AiProvider` and `AiUsageLog` models.

5. **Strategic Planning & Business Case:**
   * **[Market Analysis & Unit Economics](./docs/market_and_unit_economics.md):** 2026 market figures, competitor comparisons (Apollo, ZoomInfo, Clay, Prospeo, Findymail), build-vs-buy framework, pricing tiers, and COGS margins.
   * **[90-Day MVP Roadmap & Risk Register](./docs/roadmap_and_risk.md):** Costed 6-Sprint execution plan, team budget ($194.7k), and comprehensive risk mitigations.

---

For the main platform overview, see **[README.md](./README.md)**.
