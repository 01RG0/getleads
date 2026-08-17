const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g
const PHONE_REGEX = /(?:\+?1[-.]?)?\(?(\d{3})\)?[-. ]?(\d{3})[-. ]?(\d{4})/g

export async function crawlWebsite(
  url: string,
  scraperApiKey?: string,
): Promise<{ text: string; emails: string[]; phones: string[] }> {
  const targetUrl = scraperApiKey
    ? `https://api.scraperapi.com/?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}&render=false`
    : url

  try {
    const res = await fetch(targetUrl, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LeadScale/1.0)' },
    })
    if (!res.ok) return { text: '', emails: [], phones: [] }

    const html = await res.text()
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

    const emails = [...new Set<string>((text.match(EMAIL_REGEX) ?? []).map((e) => e.toLowerCase()))]
    const phones = [...new Set<string>(text.match(PHONE_REGEX) ?? [])]

    return { text: text.slice(0, 5000), emails, phones }
  } catch {
    return { text: '', emails: [], phones: [] }
  }
}
