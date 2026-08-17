function required(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

function optional(key: string, fallback = ''): string {
  return process.env[key] ?? fallback
}

export const config = {
  // Server
  port: parseInt(optional('PORT', '3001'), 10),
  host: optional('HOST', '0.0.0.0'),
  nodeEnv: optional('NODE_ENV', 'development'),
  isDev: optional('NODE_ENV', 'development') === 'development',
  isProd: optional('NODE_ENV', 'development') === 'production',

  // Database (Supabase)
  databaseUrl: required('DATABASE_URL'),
  directUrl: optional('DIRECT_URL'),   // optional — only needed for migrations

  // Redis (Upstash REST — used by @upstash/redis in both API and edge functions)
  upstash: {
    url: required('UPSTASH_REDIS_REST_URL'),
    token: required('UPSTASH_REDIS_REST_TOKEN'),
  },

  // Redis (standard connection — used by BullMQ/ioredis for queues)
  redisUrl: required('REDIS_URL'),

  // Security
  apiSecretKey: required('API_SECRET_KEY'),
  corsOrigin: optional('CORS_ORIGIN', '*'),

  // External enrichment APIs (all optional — waterfall degrades gracefully)
  enrichment: {
    snovApiUser: optional('SNOV_API_USER'),
    snovApiSecret: optional('SNOV_API_SECRET'),
    pdlApiKey: optional('PDL_API_KEY'),
    tombaApiKey: optional('TOMBA_API_KEY'),
    mailcheckApiKey: optional('MAILCHECK_API_KEY'),
    zerobounceApiKey: optional('ZEROBOUNCE_API_KEY'),
    scraperApiKey: optional('SCRAPERAPI_KEY'),
    numverifyApiKey: optional('NUMVERIFY_API_KEY'),
    serperApiKey: optional('SERPER_API_KEY'),
    huntApiKey: optional('HUNT_API_KEY'),
    apolloApiKey: optional('APOLLO_API_KEY'),
    prospeoApiKey: optional('PROSPEO_API_KEY'),
    findymailApiKey: optional('FINDYMAIL_API_KEY'),
    dropcontactApiKey: optional('DROPCONTACT_API_KEY'),
    millionverifierApiKey: optional('MILLIONVERIFIER_API_KEY'),
    abstractapiEmailKey: optional('ABSTRACTAPI_EMAIL_KEY'),
    neverbouncApiKey: optional('NEVERBOUNCE_API_KEY'),
    truemailHost: optional('TRUEMAIL_HOST'),
    truemailToken: optional('TRUEMAIL_TOKEN'),
    apifyToken: optional('APIFY_TOKEN'),
  },

  // Optional LLM provider credentials
  llm: {
    openrouterApiKey: optional('OPENROUTER_API_KEY'),
    githubModelsToken: optional('GITHUB_MODELS_TOKEN'),
    mistralApiKey: optional('MISTRAL_API_KEY'),
    cohereApiKey: optional('COHERE_API_KEY'),
    nvidiaApiKey: optional('NVIDIA_API_KEY'),
    sambanovaApiKey: optional('SAMBANOVA_API_KEY'),
    voyageApiKey: optional('VOYAGE_API_KEY'),
    fireworksApiKey: optional('FIREWORKS_API_KEY'),
    perplexityApiKey: optional('PERPLEXITY_API_KEY'),
    huggingfaceToken: optional('HUGGINGFACE_TOKEN'),
  },

  // Optional OSINT worker microservices; workers degrade to local tools or empty results.
  osint: {
    crawl4aiWorkerUrl: optional('CRAWL4AI_WORKER_URL'),
    holeheWorkerUrl: optional('HOLEHE_WORKER_URL'),
    crosslinkedWorkerUrl: optional('CROSSLINKED_WORKER_URL'),
    mosintWorkerUrl: optional('MOSINT_WORKER_URL'),
    phoneinfogaWorkerUrl: optional('PHONEINFOGA_WORKER_URL'),
    sherlockWorkerUrl: optional('SHERLOCK_WORKER_URL'),
    ghuntWorkerUrl: optional('GHUNT_WORKER_URL'),
    scraplingWorkerUrl: optional('SCRAPLING_WORKER_URL'),
    whatwebWorkerUrl: optional('WHATWEB_WORKER_URL'),
  },

  // Proxy waterfall — all optional, degrades to direct fetch
  proxy: {
    // Tier 1 — managed rotating APIs
    scrapingbeeApiKey:  optional('SCRAPINGBEE_API_KEY'),   // 1K req/mo free, JS rendering
    zenrowsApiKey:      optional('ZENROWS_API_KEY'),        // 1K req/mo free, anti-bot
    crawlbaseApiToken:  optional('CRAWLBASE_API_TOKEN'),    // 1K req/mo free

    // Tier 1 — datacenter proxy lists
    webshareProxyList:  optional('WEBSHARE_PROXY_LIST'),    // host:port:user:pass CSV
    webshareApiToken:   optional('WEBSHARE_API_TOKEN'),

    // Tier 2 — residential proxies (rotating endpoint)
    geonodeUsername:    optional('GEONODE_USERNAME'),       // 1GB/mo free residential
    geonodePassword:    optional('GEONODE_PASSWORD'),
    geonodeHost:        optional('GEONODE_HOST', 'rotating.geonode.com'),
    geonodePort:        optional('GEONODE_PORT', '9000'),

    iproyalUsername:    optional('IPROYAL_USERNAME'),       // 500MB/mo free residential
    iproyalPassword:    optional('IPROYAL_PASSWORD'),
    iproyalHost:        optional('IPROYAL_HOST', 'geo.iproyal.com'),
    iproyalPort:        optional('IPROYAL_PORT', '12321'),

    nodemaven:          optional('NODEMAVEN_PROXY_LIST'),   // host:port:user:pass CSV, 1GB free

    // Tier 3 — SOCKS5
    windscribeUsername: optional('WINDSCRIBE_USERNAME'),    // 10GB/mo free SOCKS5
    windscribePassword: optional('WINDSCRIBE_PASSWORD'),

    // Tier 3 — local proxybroker2 sidecar (Phase 3, self-hosted)
    proxybrokerUrl:     optional('PROXYBROKER_URL'),        // e.g. http://127.0.0.1:8888
    goproxyUrl:         optional('GOPROXY_URL'),            // self-hosted goproxy gateway
  },
} as const

export type Config = typeof config
