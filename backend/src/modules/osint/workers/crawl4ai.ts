import { spawn } from 'node:child_process'

async function callMicroservice(
  url: string,
  workerUrl: string,
): Promise<{ text: string; emails: string[]; phones: string[] }> {
  const res = await fetch(`${workerUrl}/crawl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, extract_emails: true, extract_phones: true }),
    signal: AbortSignal.timeout(60000),
  })
  if (!res.ok) return { text: '', emails: [], phones: [] }

  const data = (await res.json()) as { text?: string; emails?: string[]; phones?: string[] }
  return { text: data.text ?? '', emails: data.emails ?? [], phones: data.phones ?? [] }
}

function localRegexCrawl(html: string): { emails: string[]; phones: string[] } {
  const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g
  const PHONE_REGEX = /(?:\+?1[-.]?)?\(?(\d{3})\)?[-. ]?(\d{3})[-. ]?(\d{4})/g
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

  return {
    emails: [...new Set<string>((text.match(EMAIL_REGEX) ?? []).map((email) => email.toLowerCase()))],
    phones: [...new Set<string>(text.match(PHONE_REGEX) ?? [])],
  }
}

export async function crawlWebsite(
  url: string,
  scraperApiKey?: string,
): Promise<{ text: string; emails: string[]; phones: string[] }> {
  // Keep the node:child_process import available for local worker parity. crawl4ai's
  // local fallback is HTTP/regex based because it is normally a Docker service.
  void spawn

  const workerUrl = process.env.CRAWL4AI_WORKER_URL
  if (workerUrl) {
    try {
      return await callMicroservice(url, workerUrl)
    } catch {}
  }

  const targetUrl = scraperApiKey
    ? `https://api.scraperapi.com/?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}`
    : url

  try {
    const res = await fetch(targetUrl, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LeadScale/1.0)' },
    })
    if (!res.ok) return { text: '', emails: [], phones: [] }

    const html = await res.text()
    const parsed = localRegexCrawl(html)
    return { text: html.replace(/<[^>]+>/g, ' ').slice(0, 5000), ...parsed }
  } catch {
    return { text: '', emails: [], phones: [] }
  }
}
