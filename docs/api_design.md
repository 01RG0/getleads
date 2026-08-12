# API Design & OpenAPI Specification
## Project: LeadScale B2B Platform

---

## 1. API Core Design Principles

LeadScale exposes a modern, high-throughput **RESTful API** alongside a **Model Context Protocol (MCP) interface**.

### Key Standards:
* **Protocol & Format:** HTTPS, UTF-8 JSON requests and responses.
* **Authentication:** API Key passed in headers via `Authorization: Bearer ls_live_xxxxxxxxxxxx`.
* **Versioning:** URL path versioning (`/v1/...`).
* **Rate Limiting Headers:** Returns standard RFC 6585 rate limiting headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`).
* **Error Handling:** RFC 7807 Problem Details for HTTP APIs format.

---

## 2. Authentication & Rate Limiting Architecture

### 2.1 API Key Structure
* `ls_live_...` : Production live API keys (deducts real workspace credits).
* `ls_test_...` : Sandbox test keys (returns mock data, no credit deduction).

### 2.2 Rate Limiting Rules (Sliding Window in Redis)

| Plan Tier | Max Requests / Sec | Max Requests / Min | Daily Burst Cap |
| :--- | :--- | :--- | :--- |
| **Free / Starter** | 5 req/sec | 60 req/min | 1,000 req/day |
| **Pro / Growth** | 30 req/sec | 600 req/min | 25,000 req/day |
| **Agency / Enterprise** | 100 req/sec | 3,000 req/min | 250,000 req/day |

---

## 3. Core REST API Endpoints Specification

### 3.1 Search Contacts (`POST /v1/contacts/search`)

**Request Body:**
```json
{
  "filters": {
    "job_titles": ["VP Sales", "Head of Growth", "Chief Revenue Officer"],
    "seniorities": ["executive", "director", "vp"],
    "departments": ["sales", "marketing"],
    "locations": ["United States", "Canada", "United Kingdom"],
    "company_employee_range": ["51-200", "201-500"],
    "industries": ["Software", "SaaS", "Information Technology"],
    "technographics": ["HubSpot", "Salesforce"]
  },
  "pagination": {
    "page": 1,
    "limit": 25
  },
  "auto_enrich": false
}
```

**Response Body (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "total_results": 1420,
    "page": 1,
    "limit": 25,
    "contacts": [
      {
        "contact_id": "cnt_98f7a61b",
        "first_name": "Sarah",
        "last_name": "Jenkins",
        "job_title": "VP of Growth",
        "company": {
          "company_id": "cmp_4412a1",
          "name": "Acme SaaS Inc.",
          "domain": "acmesaashq.com",
          "employee_count": 140,
          "industry": "Software"
        },
        "location": {
          "city": "Austin",
          "state": "Texas",
          "country": "United States"
        },
        "linkedin_url": "https://www.linkedin.com/in/sarah-jenkins-growth",
        "enrichment_status": "unverified",
        "email": null,
        "phone": null
      }
    ]
  },
  "meta": {
    "request_id": "req_88a91c2b",
    "credits_deducted": 0,
    "execution_time_ms": 112
  }
}
```

---

### 3.2 Enrich Person Record (`POST /v1/enrich/person`)

Triggers the real-time Waterfall Enrichment engine.

**Request Body:**
```json
{
  "first_name": "Sarah",
  "last_name": "Jenkins",
  "domain": "acmesaashq.com",
  "company_name": "Acme SaaS Inc.",
  "linkedin_url": "https://www.linkedin.com/in/sarah-jenkins-growth",
  "include_phone": true,
  "force_reverify": false
}
```

**Response Body (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "contact_id": "cnt_98f7a61b",
    "first_name": "Sarah",
    "last_name": "Jenkins",
    "job_title": "VP of Growth",
    "email": "sarah.jenkins@acmesaashq.com",
    "email_status": "guaranteed_deliverable",
    "email_confidence_score": 98.5,
    "phone": "+1-512-555-0192",
    "phone_type": "mobile",
    "company": {
      "name": "Acme SaaS Inc.",
      "domain": "acmesaashq.com",
      "employee_count": 140,
      "headquarters": "Austin, TX"
    },
    "verification_details": {
      "mx_record_valid": true,
      "smtp_check": "250_ok",
      "is_catch_all": false,
      "is_disposable": false,
      "last_verified_at": "2026-08-12T14:22:10Z"
    },
    "provenance": {
      "data_source": "waterfall_tier1_prospeo",
      "cached": false
    }
  },
  "meta": {
    "request_id": "req_9921b71a",
    "credits_deducted": 1,
    "credits_remaining": 4999,
    "execution_time_ms": 840
  }
}
```

---

### 3.3 Verify Standalone Email (`POST /v1/verify/email`)

Performs direct 3-stage live verification without full contact search.

**Request Body:**
```json
{
  "email": "alex.m@enterpriseco.com"
}
```

**Response Body (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "email": "alex.m@enterpriseco.com",
    "status": "deliverable_catch_all",
    "confidence_score": 88.0,
    "deliverable": true,
    "checks": {
      "syntax_valid": true,
      "mx_records_found": true,
      "smtp_handshake_success": true,
      "is_catch_all": true,
      "is_disposable": false,
      "is_role_account": false,
      "is_honeypot": false
    },
    "recommendation": "safe_to_send"
  },
  "meta": {
    "request_id": "req_110293aa",
    "credits_deducted": 1,
    "execution_time_ms": 310
  }
}
```

---

### 3.4 Workspace Credit Balance (`GET /v1/workspaces/credits`)

**Response Body (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "workspace_id": "ws_agency_alpha",
    "workspace_name": "Alpha Lead Generation Agency",
    "plan_tier": "agency_unlimited",
    "credit_summary": {
      "total_credits_allocated": 100000,
      "credits_used_this_period": 34210,
      "credits_remaining": 65790,
      "sub_workspace_allocated": 25000,
      "renews_at": "2026-09-01T00:00:00Z"
    }
  }
}
```

---

## 4. Webhook Event System

LeadScale supports HTTP POST webhook notifications for asynchronous background jobs.

### Supported Events:
* `enrichment.completed`
* `batch_verification.completed`
* `credit_balance.low_warning`
* `campaign.bounce_detected`

**Webhook Sample Payload (`enrichment.completed`):**
```json
{
  "event": "enrichment.completed",
  "event_id": "evt_771239aa",
  "timestamp": "2026-08-12T14:25:00Z",
  "workspace_id": "ws_agency_alpha",
  "data": {
    "batch_id": "batch_88192",
    "total_processed": 500,
    "successful_enrichments": 468,
    "failed_enrichments": 32,
    "download_url": "https://s3.amazonaws.com/exports.leadscale.io/batch_88192_verified.csv"
  }
}
```
