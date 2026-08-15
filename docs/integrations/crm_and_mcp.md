# Integrations & MCP Protocol Specification
## Project: LeadScale B2B Platform

---

## 1. CRM & Ecosystem Integration Architecture

LeadScale seamlessly integrates with enterprise CRMs, marketing automation platforms, and workflow orchestrators to ensure bi-directional data flow.

```mermaid
graph LR
    subgraph LeadScale Core Platform
        LS[LeadScale Engine]
        MCP[MCP Agent Server]
    end

    subgraph Native CRM Connectors
        HS[HubSpot Sync Service]
        SF[Salesforce AppExchange Native Tool]
        PD[Pipedrive / Outreach Connector]
    end

    subgraph Automation Platforms
        ZAP[Zapier Integration]
        MAKE[Make.com Webhook Apps]
    end

    subgraph AI SDR Agents & LLMs
        CL[Claude Desktop / Claude Code]
        GPT[ChatGPT / Custom OpenAI Assistant]
        MS[Microsoft Dynamics Copilot Studio]
    end

    LS <--> HS
    LS <--> SF
    LS <--> PD

    LS <--> ZAP
    LS <--> MAKE

    MCP <--> CL
    MCP <--> GPT
    MCP <--> MS
```

### 1.1 Native HubSpot Integration Features
* **Bi-Directional Auto-Enrichment:** Automatically enriches new contact records created in HubSpot CRM within 2 seconds.
* **Property Mapping Customization:** Maps LeadScale firmographics (employee count, tech stack, verified email status, mobile phone) to standard or custom HubSpot contact properties.
* **Bounce Protection Guardrail:** Automatically sets HubSpot contact status to `Bounced / Do Not Contact` if LeadScale flags an existing email as invalid or risky.

### 1.2 Native Salesforce Integration
* AppExchange package supporting Bulk API 2.0.
* Automatic Lead scoring and deduplication prior to Lead-to-Contact conversion.

---

## 2. Model Context Protocol (MCP) Server Specification

### 2.1 Overview & Context
The **Model Context Protocol (MCP)**, open-sourced by Anthropic and governed by the Linux Foundation Agentic AI Foundation (AAIF), provides a standardized open protocol for connecting AI agents (Claude, ChatGPT, Microsoft Copilot) to external tools and context sources.

LeadScale natively implements an **MCP Server** (`@leadscale/mcp-server`), enabling AI SDRs and sales agents to search, enrich, verify, and initiate outreach sequences using natural language tool calls.

### 2.2 MCP Architecture & Transports
* **Transports Supported:**
  1. `STDIO` (Standard Input/Output) - For local AI agent integrations (e.g., Claude Desktop, Cursor, local python scripts).
  2. `SSE` (Server-Sent Events over HTTP/TLS) - For cloud-based AI agent runners and hosted enterprise web apps.
* **Authentication:** MCP header `Authorization: Bearer ls_live_mcp_xxxxxxxxxxxx`.

---

## 3. MCP Tool Definitions (JSON Schemas for LLMs)

The LeadScale MCP server exposes 5 primary tool functions to AI agents:

### 3.1 Tool 1: `search_leads`

**Tool Name:** `search_leads`  
**Description:** Search the LeadScale B2B contact database for target decision-makers matching ICP filters.

```json
{
  "name": "search_leads",
  "description": "Searches for decision-maker B2B contacts based on ICP filters such as job title, company size, industry, location, and technology stack.",
  "parameters": {
    "type": "object",
    "properties": {
      "job_titles": {
        "type": "array",
        "items": { "type": "string" },
        "description": "List of job titles to match (e.g. ['VP of Sales', 'Chief Technology Officer'])"
      },
      "industries": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Target industries (e.g. ['Software', 'Fintech', 'Healthcare'])"
      },
      "company_size_min": {
        "type": "integer",
        "description": "Minimum employee count"
      },
      "company_size_max": {
        "type": "integer",
        "description": "Maximum employee count"
      },
      "countries": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Target countries (e.g. ['United States', 'United Kingdom'])"
      },
      "limit": {
        "type": "integer",
        "default": 10,
        "description": "Number of contacts to return (max 50)"
      }
    },
    "required": ["job_titles"]
  }
}
```

---

### 3.2 Tool 2: `enrich_contact`

**Tool Name:** `enrich_contact`  
**Description:** Execute real-time multi-provider waterfall enrichment to retrieve guaranteed verified email address and phone number for a specific person.

```json
{
  "name": "enrich_contact",
  "description": "Triggers real-time waterfall enrichment for a prospect to find verified email, direct phone, and detailed company firmographics.",
  "parameters": {
    "type": "object",
    "properties": {
      "first_name": {
        "type": "string",
        "description": "First name of the prospect"
      },
      "last_name": {
        "type": "string",
        "description": "Last name of the prospect"
      },
      "domain": {
        "type": "string",
        "description": "Company domain name (e.g. 'stripe.com')"
      },
      "company_name": {
        "type": "string",
        "description": "Company name if domain is unknown"
      },
      "linkedin_url": {
        "type": "string",
        "description": "Prospect's LinkedIn profile URL if available"
      }
    },
    "required": ["first_name", "last_name", "domain"]
  }
}
```

---

### 3.3 Tool 3: `verify_email_deliverability`

**Tool Name:** `verify_email_deliverability`  
**Description:** Execute deep 3-stage live SMTP verification on an email address before sending cold outreach.

```json
{
  "name": "verify_email_deliverability",
  "description": "Verifies an email address in real time using 3-stage SMTP handshake to ensure bounce rate <2%.",
  "parameters": {
    "type": "object",
    "properties": {
      "email": {
        "type": "string",
        "format": "email",
        "description": "Email address to verify"
      }
    },
    "required": ["email"]
  }
}
```

---

### 3.4 Tool 4: `check_workspace_credits`

**Tool Name:** `check_workspace_credits`  
**Description:** Query remaining credit quota for the active workspace.

```json
{
  "name": "check_workspace_credits",
  "description": "Returns remaining credits, billing tier, and renewal date for the workspace.",
  "parameters": {
    "type": "object",
    "properties": {}
  }
}
```

---

### 3.5 Tool 5: `enroll_in_sequence`

**Tool Name:** `enroll_in_sequence`  
**Description:** Add a verified contact into an automated outreach sequence.

```json
{
  "name": "enroll_in_sequence",
  "description": "Enrolls a verified contact into an outreach sequence or email campaign.",
  "parameters": {
    "type": "object",
    "properties": {
      "contact_id": {
        "type": "string",
        "description": "The unique contact_id returned from enrich_contact"
      },
      "campaign_id": {
        "type": "string",
        "description": "The unique campaign identifier"
      },
      "custom_variables": {
        "type": "object",
        "description": "Key-value pair of custom personalization snippet variables"
      }
    },
    "required": ["contact_id", "campaign_id"]
  }
}
```

---

## 4. MCP System Prompts & Resources

### 4.1 MCP System Resource Example
`leadscale://resources/workspace_status`  
Returns live JSON status of credit balance, active sequences, and domain deliverability score.

### 4.2 MCP Pre-Built Prompt Template (`leadscale://prompts/outreach_brief`)
**Template:**
> "You are an expert AI SDR. Use `search_leads` to find 5 target prospects in `{industry}` with job title `{job_title}`. For each prospect found, call `enrich_contact` to get verified contact details. Validate that `email_status` is `guaranteed_deliverable` using `verify_email_deliverability`. Finally, output a structured table with prospect name, verified email, direct dial, and a tailored 2-sentence cold outreach snippet based on their company technographics."
