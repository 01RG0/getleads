export interface ScraplingResult {
  url: string
  emails: string[]
  phones: string[]
  linkedin_urls: string[]
  status: number
}

export async function scrapeStealth(url: string, stealth = false): Promise<ScraplingResult | null> {
  const workerUrl = process.env.SCRAPLING_WORKER_URL
  if (!workerUrl) return null

  try {
    const res = await fetch(workerUrl + '/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        stealth,
        css_selectors: {
          emails: "a[href^='mailto:']::attr(href)",
          phones: "a[href^='tel:']::attr(href)",
          linkedin: "a[href*='linkedin.com']::attr(href)",
        },
      }),
      signal: AbortSignal.timeout(120000),
    })
    if (!res.ok) return null

    const data = await res.json() as {
      data?: { emails?: string[]; phones?: string[]; linkedin?: string[] }
      status?: number
    }
    const scraped = data.data ?? {}
    return {
      url,
      emails: (scraped.emails ?? []).map((email) => email.replace('mailto:', '').toLowerCase()),
      phones: (scraped.phones ?? []).map((phone) => phone.replace('tel:', '')),
      linkedin_urls: scraped.linkedin ?? [],
      status: data.status ?? 200,
    }
  } catch {
    return null
  }
}
