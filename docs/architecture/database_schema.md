# Database Schema Specification & ERD
## Project: LeadScale B2B Platform

---

## 1. Relational Database Overview & Multi-Tenancy Architecture

The LeadScale database architecture uses PostgreSQL 16+ as the transactional store. Multi-tenancy is implemented through a **Parent-Child Workspace Hierarchy** with Row-Level Security (RLS) policies.

### Core Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    ORGANIZATION ||--o{ WORKSPACE : "owns"
    WORKSPACE ||--o{ WORKSPACE_MEMBER : "has"
    USER ||--o{ WORKSPACE_MEMBER : "belongs_to"
    WORKSPACE ||--o{ API_KEY : "issues"
    WORKSPACE ||--o{ CREDIT_LEDGER : "consumes/grants"
    WORKSPACE ||--o{ CAMPAIGN : "runs"
    CAMPAIGN ||--o{ CAMPAIGN_CONTACT : "contains"
    CONTACT ||--o{ CAMPAIGN_CONTACT : "enrolled_in"
    COMPANY ||--o{ CONTACT : "employs"
    CONTACT ||--o{ VERIFICATION_LOG : "has_history"
    CONTACT ||--o{ CONSENT_LOG : "has_compliance"
    AI_PROVIDER ||--o{ AI_USAGE_LOG : "generates"

    ORGANIZATION {
        uuid id PK
        string name
        string tier
        timestamp created_at
    }

    WORKSPACE {
        uuid id PK
        uuid organization_id FK
        uuid parent_workspace_id FK
        string name
        string type
        integer monthly_credit_quota
        timestamp created_at
    }

    USER {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        timestamp created_at
    }

    WORKSPACE_MEMBER {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        string role
    }

    COMPANY {
        uuid id PK
        string name
        string domain UK
        integer employee_count
        string industry
        jsonb technographics
        timestamp updated_at
    }

    CONTACT {
        uuid id PK
        uuid company_id FK
        string first_name
        string last_name
        string email
        string email_status
        float confidence_score
        string phone
        string linkedin_url
        timestamp verified_at
    }

    VERIFICATION_LOG {
        uuid id PK
        uuid contact_id FK
        string email
        string status
        boolean mx_valid
        string smtp_response
        boolean is_catch_all
        timestamp created_at
    }

    AI_PROVIDER {
        uuid id PK
        string name UK
        string base_url
        string api_key_encrypted
        boolean is_active
        integer priority_order
    }

    AI_USAGE_LOG {
        uuid id PK
        uuid provider_id FK
        string task_type
        integer prompt_tokens
        integer completion_tokens
        integer latency_ms
    }

    CREDIT_LEDGER {
        uuid id PK
        uuid workspace_id FK
        integer credit_amount
        string transaction_type
        string description
        timestamp created_at
    }

    CAMPAIGN {
        uuid id PK
        uuid workspace_id FK
        string name
        string status
        timestamp created_at
    }

    CONSENT_LOG {
        uuid id PK
        uuid contact_id FK
        string action_type
        string source
        timestamp action_timestamp
    }
```

---

## 2. Table Field Specifications

### 2.1 `organizations` & `workspaces`
* `organizations`: Top-level billing account entity (e.g. Agency or Enterprise company).
* `workspaces`: Sub-tenant environment. Supports nested hierarchies (`parent_workspace_id` points to another workspace ID for agency-client multi-tenancy).

### 2.2 `contacts` & `companies`
* `contacts.email_status` Enum: `unverified`, `guaranteed_deliverable`, `deliverable_catch_all`, `risky`, `invalid`.
* `contacts.confidence_score`: Float between 0.00 and 100.00 representing deliverability likelihood.

### 2.3 `ai_providers` & `ai_usage_logs` (Multi-LLM Management)
* `ai_providers`: Admin-configurable AI/LLM API registry (Groq, Gemini Flash, OpenRouter, DeepSeek, Cerebras, etc.). Allows admins to add, track, re-prioritize, or remove LLM APIs dynamically.
* `ai_usage_logs`: Real-time audit trail tracking prompt/completion tokens, latency, cost savings, and task execution success per AI provider.

### 2.4 `credit_ledger`
* Immutable double-entry ledger.
* `transaction_type` Enum: `monthly_grant`, `purchase`, `enrichment_deduction`, `verification_deduction`, `bounce_refund`, `agency_sub_allocation`.
