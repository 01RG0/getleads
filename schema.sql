-- =============================================================================
-- LeadScale B2B Platform - Production Database Schema (PostgreSQL 16+)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
CREATE TYPE org_tier_enum AS ENUM ('free_trial', 'starter', 'pro_growth', 'agency_unlimited', 'enterprise');
CREATE TYPE workspace_type_enum AS ENUM ('agency_parent', 'client_child', 'standalone');
CREATE TYPE user_role_enum AS ENUM ('super_admin', 'agency_owner', 'workspace_admin', 'member', 'read_only');
CREATE TYPE email_status_enum AS ENUM ('unverified', 'guaranteed_deliverable', 'deliverable_catch_all', 'risky', 'invalid', 'pending');
CREATE TYPE phone_type_enum AS ENUM ('mobile', 'direct_dial', 'switchboard', 'unknown');
CREATE TYPE credit_tx_type_enum AS ENUM ('monthly_grant', 'topup_purchase', 'enrichment_deduction', 'verification_deduction', 'bounce_refund', 'agency_child_transfer', 'rollover_expire');
CREATE TYPE campaign_status_enum AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');
CREATE TYPE consent_action_enum AS ENUM ('opt_in', 'opt_out_request', 'gdpr_erasure_request', 'suppression_added');

-- -----------------------------------------------------------------------------
-- Table 1: Organizations (Top-level Billing Entity)
-- -----------------------------------------------------------------------------
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    tier org_tier_enum NOT NULL DEFAULT 'starter',
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table 2: Workspaces (Multi-Tenant Workspace & Agency Structure)
-- -----------------------------------------------------------------------------
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type workspace_type_enum NOT NULL DEFAULT 'standalone',
    monthly_credit_quota INTEGER NOT NULL DEFAULT 1000,
    credit_balance INTEGER NOT NULL DEFAULT 1000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workspaces_org ON workspaces(organization_id);
CREATE INDEX idx_workspaces_parent ON workspaces(parent_workspace_id);

-- -----------------------------------------------------------------------------
-- Table 3: Users
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- -----------------------------------------------------------------------------
-- Table 4: Workspace Memberships (RBAC)
-- -----------------------------------------------------------------------------
CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role_enum NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- -----------------------------------------------------------------------------
-- Table 5: API Keys & MCP Tokens
-- -----------------------------------------------------------------------------
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(16) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    is_mcp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- -----------------------------------------------------------------------------
-- Table 6: AI Providers Registry (Multi-LLM Router Engine)
-- -----------------------------------------------------------------------------
CREATE TABLE ai_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'groq', 'gemini_flash', 'openrouter_free'
    base_url TEXT NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    priority_order INTEGER NOT NULL DEFAULT 10,
    cost_per_1k_input_tokens NUMERIC(8,6) DEFAULT 0.000000,
    cost_per_1k_output_tokens NUMERIC(8,6) DEFAULT 0.000000,
    rate_limit_rpm INTEGER DEFAULT 30,
    rate_limit_tpm INTEGER DEFAULT 100000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES ai_providers(id) ON DELETE SET NULL,
    task_type VARCHAR(100) NOT NULL, -- e.g., 'outreach_draft', 'extract_firmographics', 'catchall_verify'
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    latency_ms INTEGER NOT NULL,
    is_success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_provider ON ai_usage_logs(provider_id);

-- -----------------------------------------------------------------------------
-- Table 7: Companies (Firmographics)
-- -----------------------------------------------------------------------------
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    employee_count INTEGER,
    employee_range VARCHAR(50),
    industry VARCHAR(255),
    revenue_range VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    linkedin_url TEXT,
    technographics JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companies_domain ON companies(domain);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_technographics ON companies USING gin (technographics);

-- -----------------------------------------------------------------------------
-- Table 8: Contacts (B2B Leads)
-- -----------------------------------------------------------------------------
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    seniority VARCHAR(50),
    department VARCHAR(100),
    email VARCHAR(255),
    email_status email_status_enum NOT NULL DEFAULT 'unverified',
    confidence_score NUMERIC(5,2) DEFAULT 0.00,
    phone VARCHAR(50),
    phone_type phone_type_enum DEFAULT 'unknown',
    linkedin_url TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_contacts_title_trgm ON contacts USING gin (job_title gin_trgm_ops);

-- -----------------------------------------------------------------------------
-- Table 9: Verification Logs (Audit Trail)
-- -----------------------------------------------------------------------------
CREATE TABLE verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    status email_status_enum NOT NULL,
    mx_valid BOOLEAN NOT NULL DEFAULT FALSE,
    smtp_code VARCHAR(10),
    smtp_response TEXT,
    is_catch_all BOOLEAN NOT NULL DEFAULT FALSE,
    is_disposable BOOLEAN NOT NULL DEFAULT FALSE,
    provider_used VARCHAR(100) NOT NULL,
    latency_ms INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verif_logs_contact ON verification_logs(contact_id);

-- -----------------------------------------------------------------------------
-- Table 10: Credit Ledger (Immutable Financial Journal)
-- -----------------------------------------------------------------------------
CREATE TABLE credit_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL, -- Positive for grants, negative for consumption
    transaction_type credit_tx_type_enum NOT NULL,
    description TEXT NOT NULL,
    reference_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_ledger_workspace ON credit_ledger(workspace_id);

-- -----------------------------------------------------------------------------
-- Table 11: Campaigns & Sequences
-- -----------------------------------------------------------------------------
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status campaign_status_enum NOT NULL DEFAULT 'draft',
    target_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    bounce_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE campaign_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'enrolled',
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(campaign_id, contact_id)
);

-- -----------------------------------------------------------------------------
-- Table 12: Compliance & Consent Logs (GDPR / CCPA / CAN-SPAM)
-- -----------------------------------------------------------------------------
CREATE TABLE consent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_email_hash VARCHAR(255) NOT NULL UNIQUE,
    action_type consent_action_enum NOT NULL,
    source VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consent_hash ON consent_logs(contact_email_hash);
