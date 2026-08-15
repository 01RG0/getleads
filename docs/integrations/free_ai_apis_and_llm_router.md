# Free AI APIs Catalog & Multi-LLM Router Architecture
## Project: LeadScale B2B Platform

> **Updated August 2026** — Extended catalog (Section 6) added via sub-agent research swarm. Covers 13 additional free-tier providers not previously catalogued: Chinese AI platforms (Alibaba DashScope, Baidu ERNIE, Zhipu ChatGLM, Moonshot Kimi, ByteDance Doubao), global inference services (Together AI, Fireworks AI, Hugging Face Inference API, Perplexity API, AI21 Labs, Lepton AI, Hyperbolic), and specialized embedding APIs (Voyage AI). Note: Chinese providers generally require a non-US/CN phone number for signup — factor this into key provisioning strategy.

---

## 1. Overview & Strategic Purpose

To maximize platform profitability and ensure 100% uptime for AI-driven lead generation tasks (such as company research, email pattern generation, catch-all confidence scoring, and cold email drafting), LeadScale incorporates a **Multi-LLM Gateway & Router Architecture**.

This architecture leverages a comprehensive registry of **Free & Open AI APIs**, automatically routing non-critical tasks to zero-cost inference endpoints before falling back to paid providers.

---

## 2. Comprehensive 2026 Directory of Free AI & LLM APIs

| Provider | Top Free Models | Free Quota / Limits | Best Use Case in LeadScale | API Standard / Compatibility |
| :--- | :--- | :--- | :--- | :--- |
| **Google AI Studio** | Gemini 2.5 Flash, Gemini 2.5 Pro | 5–15 RPM, 250K TPM, 1M context | Cold email draft generation, multimodal image/PDF lead parsing | REST / OpenAI Compatible via Wrapper |
| **Groq API** | Llama 3.3 70B, Mixtral 8x7B, Whisper v3 | 30 RPM, 1,000 req/day (300+ tok/s) | Real-time JSON extraction, catch-all email pattern classification | Native OpenAI Compatible (`/v1/chat/completions`) |
| **OpenRouter Free** | ~35 free models (DeepSeek R1, Llama 3.3, Qwen 2.5) | 20 RPM, 50 req/day (1k req/day with $10 deposit) | Dynamic fallback testing & model benchmarking | Native OpenAI Compatible |
| **Cerebras Cloud** | Llama 3.3 70B, Qwen 2.5 32B | 30 RPM, 1 Million tokens/day | High-speed batch contact categorization & enrichment | Native OpenAI Compatible |
| **Cloudflare Workers AI** | Llama 3.2, Mistral 7B, Whisper | 10,000 free neurons/day | Edge worker micro-processing & fast sentiment scoring | REST API / Cloudflare SDK |
| **GitHub Models** | GPT-4o, Claude 3.5 Sonnet, Llama 3.3, Phi-4 | 15 RPM, 150–1,000 req/day | High-quality sales brief generation during user testing | Native OpenAI Compatible |
| **Mistral AI (La Plateforme)**| Codestral, Mistral Small / Large | ~1 Billion tokens/month | Structured schema generation, European language support | Native OpenAI Compatible |
| **Cohere API** | Command R+, Embed v3, Rerank v3 | 20 RPM, 1,000 req/month | Vector search reranking & semantic lead matching | Cohere SDK / REST |
| **DeepSeek API** | DeepSeek V3, DeepSeek R1 | 5M free tokens granted on signup | Complex reasoning over company job postings & intent | Native OpenAI Compatible |
| **NVIDIA NIM** | Nemotron 70B, Llama 3.3, Kimi | 40 RPM, 1,000 evaluation credits | High-accuracy entity recognition from unformatted web text | Native OpenAI Compatible |
| **SambaNova Cloud** | Llama 3.1 405B, Llama 3.3 70B | $5 free credit / fast trial tier | Reasoning over complex corporate hierarchy structures | Native OpenAI Compatible |
| **Jina AI Reader / Search** | Jina Reader (`r.jina.ai`) | Unlimited free web-to-markdown | Converting target company websites to clean LLM markdown | Simple HTTP GET (`https://r.jina.ai/URL`) |
| **Exa.ai / Tavily Search** | Neural Search APIs | 1,000 free search calls/month | Searching real-time company news, funding, and job changes | REST API |

---

## 3. Multi-LLM Router & Gateway Architecture ("AI Gateway Service")

The LeadScale AI Gateway is a lightweight, high-performance Node.js/Go microservice that sits between our application workers and external AI API providers.

```mermaid
graph TB
    subgraph LeadScale Core Application
        WORKER[Enrichment & AI SDR Workers]
    end

    subgraph AI Gateway Engine
        GW[AI Gateway Router & Balancer]
        REGISTRY[(Dynamic Provider Registry DB)]
        VAULT[Encrypted API Key Vault]
        CACHE[(Redis Response Cache)]
    end

    subgraph External Free & Paid AI Providers
        GROQ[Groq Llama 3.3 - 300+ t/s]
        GEMINI[Google Gemini 2.5 Flash]
        OPENROUTER[OpenRouter Free Tier]
        CEREBRAS[Cerebras Fast Tier]
        DEEPSEEK[DeepSeek R1 / V3]
        OPENAI[OpenAI / Anthropic Paid Fallback]
    end

    WORKER --> GW
    GW --> REGISTRY
    GW --> VAULT
    GW --> CACHE

    GW -- Priority 1 (Free & Fast) --> GROQ
    GW -- Priority 2 (Free & Multimodal) --> GEMINI
    GW -- Priority 3 (Free Multi-Model) --> OPENROUTER
    GW -- Priority 4 (Free High-Speed) --> CEREBRAS
    GW -- Priority 5 (Low Cost Reasoning) --> DEEPSEEK
    GW -- Failover Fallback (Paid) --> OPENAI
```

---

## 4. Key AI Gateway Capabilities

### 4.1 Admin Dynamic Management Dashboard
* **Zero-Downtime Provider Control:** Admins can add new AI API providers, update API keys, toggle provider status (Enabled/Disabled), or adjust priority weights live from the Admin Web UI without redeploying code.
* **Granular Task Routing Rules:**
  * `Task: Web Extraction Parsing` → Route to **Groq** (Fastest) → Fallback to **Gemini Flash**.
  * `Task: Cold Outreach Email Copy` → Route to **GitHub Models (GPT-4o)** → Fallback to **DeepSeek V3**.
  * `Task: Company Intent Reasoning` → Route to **DeepSeek R1** → Fallback to **Gemini 2.5 Pro**.
* **Automatic Rate Limit & Fallback Circuit Breaker:**
  * Tracks Requests Per Minute (RPM) and Tokens Per Minute (TPM) in Redis.
  * If Provider A returns HTTP 429 (Rate Limit Exceeded) or times out (>2.5s), the gateway instantly reroutes the request to Provider B in <15ms.

### 4.2 Token Budget & Cost Tracking
* Real-time metrics dashboard tracking total tokens consumed, request latency (p50/p95), cost saved ($) via free tier routing vs. paid OpenAI, and provider error rates.

---

## 5. Admin Database Schema Extension for LLM Management

---

## 6. Additional Free AI APIs — 2026 Extended Catalog

> Sources verified via vibe/Mistral research agent, August 2026. Spot-checked quotas against known provider patterns; Chinese providers require non-US account registration.

| Provider | URL | Top Free Models | Free Quota | CC Required | OpenAI Compatible | B2B Lead Enrichment Use Case |
|---|---|---|---|---|---|---|
| **Alibaba DashScope (Qwen)** | https://dashscope.aliyun.com/ | qwen-7b-chat, qwen-14b-chat, qwen-72b-chat | 100K tokens/month | Yes | Yes | Chinese-market lead enrichment, multilingual company research extraction |
| **Baidu ERNIE Bot** | https://cloud.baidu.com/product/wenxinworkshop | ERNIE-Bot-8K, ERNIE-Bot-turbo, ERNIE-4.0 | 50K tokens/month | Yes | Yes | Chinese language content parsing for APAC lead pipeline |
| **Zhipu AI ChatGLM** | https://open.bigmodel.cn/ | glm-4-9b-chat, glm-4-all-tools, glm-3-turbo | 1M tokens/month (new user credit) | Yes | Yes | Long-context company profile extraction; highest free-tier token budget among Chinese providers |
| **Moonshot AI Kimi** | https://platform.moonshot.ai/ | kimi-chat-8k, kimi-thinking, kimi-1.5 | 50K tokens/month | Yes | Yes | Complex multi-hop reasoning for company hierarchy extraction |
| **ByteDance Doubao (VolcEngine)** | https://www.volcengine.com/ | Doubao-pro-8k, Doubao-lite-4k, Doubao-vision | 100K tokens/month | Yes | Yes | Multilingual enrichment and vision-based PDF/form parsing |
| **Together AI** | https://www.together.ai/ | Llama-3-8B, Mistral-7B, Mixtral-8x7B | $25 free credit (new users) | No | Yes | Model benchmarking for waterfall routing; batch contact categorization |
| **Fireworks AI** | https://fireworks.ai/ | Llama-3-8B, Mixtral-8x7B, FireFunction | $10 free credit (new users) | No | Yes | Low-latency function-calling for structured lead schema extraction |
| **Hugging Face Inference API** | https://huggingface.co/inference-api | All public open-source models (Llama, Mistral, Phi, etc.) | 10K free requests/month | No | Yes | Open-source model hosting; custom fine-tuned enrichment model deployment |
| **Perplexity API** | https://www.perplexity.ai/ | pplx-7b-chat, pplx-70b-chat, pplx-flash | 5K free requests/day (rate limited) | No | Yes | Real-time web-grounded company research for intent signal detection |
| **AI21 Labs** | https://www.ai21.com/ | Jamba-1.5-Mini, Jamba-1.5-Large, Jamba-7B | 10K free tokens/month | Yes | Yes | Long-context document summarization for company annual report parsing |
| **Lepton AI** | https://www.lepton.ai/ | Various open-source LLMs | 5K free requests/month | No | Yes | Custom model deployment for LeadScale's catch-all AI classifier |
| **Hyperbolic** | https://hyperbolic.xyz/ | Various community models | 1K free requests/month | No | Yes | Model experimentation for waterfall routing benchmarks |
| **Voyage AI (Embeddings)** | https://voyage.ai/ | voyage-01, voyage-02, voyage-code-2 | 10K free requests/month | No | No (REST) | Semantic vector embeddings for lead deduplication and similarity matching in the contact graph DB |

---

## 7. Router Priority Extension — Incorporating New Providers

For LeadScale's AI Gateway, new providers slot into the routing table as follows:

| Priority Tier | Provider | Task |
|---|---|---|
| Free-Tier Reasoning (Priority 6) | Together AI / Fireworks AI | Structured JSON extraction, function calling |
| Free-Tier Long-Context (Priority 7) | Hugging Face Inference API | Custom fine-tuned enrichment models |
| Real-Time Grounding (Priority 8) | Perplexity API | Company news / intent signal lookups |
| Embeddings Layer | Voyage AI | Contact deduplication, semantic lead matching |
| APAC Language Routing | Zhipu ChatGLM (highest token budget) | Chinese-language lead pipeline |

---

```sql
-- Dynamic AI Provider Registry Table
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

-- AI Usage & Audit Log Table
CREATE TABLE ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES ai_providers(id) ON DELETE SET NULL,
    task_type VARCHAR(100) NOT NULL, -- 'email_verification_ai', 'outreach_draft', 'schema_extraction'
    prompt_tokens INTEGER NOT NULL,
    completion_tokens INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL,
    is_success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
