export interface Stage2Result {
  smtpCode: string
  deliverable: boolean
  isCatchAll: boolean
  isDisposable: boolean
  provider: string
}

async function tryMailcheck(email: string, apiKey: string): Promise<Stage2Result | null> {
  try {
    const res = await fetch(`https://api.mailcheck.ai/v1/${encodeURIComponent(email)}`, {
      headers: { 'x-api-key': apiKey },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as any
    return {
      smtpCode: data.smtp_check ? '250' : '550',
      deliverable: data.deliverable ?? false,
      isCatchAll: data.catch_all ?? false,
      isDisposable: data.disposable ?? false,
      provider: 'mailcheck',
    }
  } catch {
    return null
  }
}

async function tryZeroBounce(email: string, apiKey: string): Promise<Stage2Result | null> {
  try {
    const params = new URLSearchParams({ email, api_key: apiKey })
    const res = await fetch(`https://api.zerobounce.net/v2/validate?${params}`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as any
    const statusMap: Record<string, boolean> = { valid: true, catch_all: true, unknown: false, invalid: false, spamtrap: false, abuse: false, do_not_mail: false }
    return {
      smtpCode: statusMap[data.status] ? '250' : '550',
      deliverable: statusMap[data.status] ?? false,
      isCatchAll: data.status === 'catch_all',
      isDisposable: data.sub_status === 'disposable',
      provider: 'zerobounce',
    }
  } catch {
    return null
  }
}

export async function runStage2(
  email: string,
  apiKeys: { mailcheck?: string; zerobounce?: string },
): Promise<Stage2Result> {
  if (apiKeys.mailcheck) {
    const result = await tryMailcheck(email, apiKeys.mailcheck)
    if (result) return result
  }

  if (apiKeys.zerobounce) {
    const result = await tryZeroBounce(email, apiKeys.zerobounce)
    if (result) return result
  }

  return { smtpCode: 'UNKNOWN', deliverable: false, isCatchAll: false, isDisposable: false, provider: 'none' }
}
