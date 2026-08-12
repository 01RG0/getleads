# System Architecture & Tech Stack Document
## Project: LeadScale B2B Platform

---

## 1. Architectural Overview & System Components

LeadScale is designed as a **cloud-native, decoupled, event-driven micro-monolith** optimized for low-latency search queries, distributed asynchronous waterfall enrichment, real-time verification processing, multi-LLM gateway routing, and seamless MCP integration.

```mermaid
graph TB
    subgraph Client Layer
        A1[Web Dashboard - Next.js 14]
        A2[Chrome Extension - Manifest V3]
        A3[Third-Party CRMs - HubSpot/Salesforce]
        A4[AI Agents / Claude / ChatGPT - MCP Client]
    end

    subgraph Edge & API Gateway Layer
        B1[Cloudflare Enterprise DNS / WAF]
        B2[Kong / Fastify API Gateway]
        B3[Rate Limiter & Auth Guard - Redis]
    end

    subgraph Core Application Services
        C1[Workspace & User Service - Node.js]
        C2[Prospect Search Service - Go]
        C3[Waterfall Enrichment Orchestrator - Go / Python]
        C4[Real-Time Verification Engine - Python Asyncio]
        C5[MCP Protocol Server - TypeScript]
        C6[AI Gateway & LLM Router - Node.js]
        C7[Open-Source OSINT Worker Fleet - Docker]
    end

    subgraph External AI Provider Registry
        LLM1[Groq Llama 3.3 - Free Tier]
        LLM2[Google Gemini 2.5 Flash - Free Tier]
        LLM3[OpenRouter / DeepSeek / Cerebras]
    end

    subgraph Distributed Queue & Event Bus
        D1[Redis Cluster - BullMQ Queue]
        D2[Apache Kafka / RabbitMQ Event Bus]
    end

    subgraph Data & Storage Layer
        E1[(PostgreSQL 16 - Main Relational DB)]
        E2[(ClickHouse - Analytics & Audit Logs)]
        E3[(Meilisearch / Elasticsearch - Contact Index)]
        E4[(Redis Cache - Latency Tier)]
        E5[S3 / Cloudflare R2 - CSV Exports & Snapshots]
    end

    A1 --> B1
    A2 --> B1
    A3 --> B1
    A4 --> B1

    B1 --> B2
    B2 --> B3
    B3 --> C1
    B3 --> C2
    B3 --> C3
    B3 --> C4
    B3 --> C5
    B3 --> C6
    B3 --> C7

    C6 --> LLM1
    C6 --> LLM2
    C6 --> LLM3

    C2 --> E3
    C2 --> E4

    C3 --> D1
    C4 --> D1
    C7 --> D1
    D1 --> D2

    C1 --> E1
    C3 --> E1
    C5 --> E1
    C6 --> E1
    C7 --> E1

    C3 --> E2
    C4 --> E2
    C6 --> E2

    D2 --> E5
```

---

## 2. Tech Stack Recommendation & Justification

| Layer / Subsystem | Recommended Technology | Alternatives Evaluated | Strategic Justification |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14+ (App Router, React 18/19, TypeScript)** | Vue.js, SvelteKit | Standard for modern GTM SaaS. Server Components for instant initial page loads; native support for Shadcn UI & Tailwind CSS. |
| **UI Component Library** | **Shadcn UI + Tailwind CSS + Lucide Icons** | MUI, Ant Design | Fully customizable, accessible, light bundle size, modern clean aesthetic expected by RevOps/Agencies. |
| **API Gateway & Core API** | **Fastify (Node.js/TypeScript) + Go (Golang API)** | Express.js, NestJS | Fastify handles 4x requests/sec vs. Express; Go provides ultra-low-latency execution for search filters and batch processing. |
| **Verification & Scraping Workers** | **Python 3.12 (Asyncio, Playwright, Scrapy)** | Node.js Worker Threads | Superior asynchronous networking libraries (`aiohttp`, `twisted`) for low-level TCP socket pings and distributed proxy rotation. |
| **Open-Source OSINT Workers** | **Docker Containers (Crawl4AI, Holehe, PhoneInfoga)** | Native Python subprocesses | Isolated microservice execution prevents dependency conflicts and isolates GPL/MIT open-source code from core proprietary codebase. |
| **AI Gateway & LLM Router** | **Node.js Gateway / LiteLLM Proxy Wrapper** | Custom Python router | Provides a unified OpenAI-compatible endpoint that dynamically manages, tracks, rate-limits, and falls back across 15+ free/paid LLM APIs. |
| **Primary Relational DB** | **PostgreSQL 16 (AWS Aurora / Supabase)** | MySQL, MongoDB | Native support for Row-Level Security (RLS) for multi-tenancy, JSONB attributes, robust ACID transactions for credit ledger. |
| **Search Engine / Index** | **Meilisearch / PostgreSQL `pg_trgm`** | Elasticsearch | Meilisearch offers ultra-fast sub-50ms typo-tolerant search across millions of records with 1/10th the RAM footprint of Elasticsearch. |
| **Analytics & Audit Logs** | **ClickHouse** | Snowflake, BigQuery | Columnar DB capable of writing 100k events/sec and running sub-second analytics on billions of credit/verification audit logs at low cost. |
| **Queue & Caching** | **Redis Enterprise / DragonflyDB + BullMQ** | RabbitMQ, Celery | BullMQ provides reliable distributed job queueing with delayed retries, rate-limiting per worker, and dead-letter queues. |
| **AI / Agent Protocols** | **Model Context Protocol (MCP) TypeScript SDK** | Custom LangChain wrappers | Anthropic / AAIF open standard. Enables out-of-the-box compatibility with Claude Desktop, Cursor, ChatGPT, and custom AI SDR agents. |
| **Infrastructure & Hosting** | **AWS (EKS / ECS Fargate) + Cloudflare** | Vercel + Render | Fargate/EKS allows scaling background scraping/verification workers independently from API web servers; Cloudflare provides WAF and DDoS mitigation. |

---

## 3. High-Level Subsystem Breakdown

### 3.1 Workspace & Multi-Tenancy Engine
* **Row-Level Security (RLS):** Every PostgreSQL table contains `workspace_id`. Queries are automatically scoped to the authenticated workspace context via database session parameters.
* **Credit Ledger Engine:** Uses double-entry bookkeeping principles. Every credit transaction creates an immutable record in ClickHouse and PostgreSQL, preventing race conditions during concurrent API requests.

### 3.2 Dynamic AI Gateway & LLM Router
* **Admin-Configurable LLM Registry:** Admins can dynamically add, enable, disable, re-prioritize, or remove LLM API providers (`ai_providers` table) via the Admin UI without code deployment.
* **Free AI Tier Maximization:** Routes non-critical tasks (e.g. cold email drafting, firmographic summary, catch-all pattern analysis) to permanent free AI tiers (Groq, Gemini 2.5 Flash, OpenRouter Free, Cerebras, GitHub Models) before falling back to paid OpenAI models.

### 3.3 Containerized Open-Source OSINT Worker Fleet
* **Isolated Execution:** Integrates top open-source lead generation repos (`crawl4ai`, `holehe`, `phoneinfoga`, `Crosslinked`) inside containerized Docker microservices triggered by BullMQ queues.
