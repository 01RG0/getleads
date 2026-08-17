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

async function tryMillionVerifier(email: string, apiKey: string): Promise<Stage2Result | null> {
  try {
    const params = new URLSearchParams({ api: apiKey, email })
    const res = await fetch(`https://api.millionverifier.com/api/v3/?${params}`, {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as any
    const deliverable = data.result === 'ok'
    return {
      smtpCode: deliverable ? '250' : '550',
      deliverable,
      isCatchAll: data.result === 'catchall',
      isDisposable: data.subresult === 'disposable',
      provider: 'millionverifier',
    }
  } catch {
    return null
  }
}

async function tryAbstractApi(email: string, apiKey: string): Promise<Stage2Result | null> {
  try {
    const params = new URLSearchParams({ api_key: apiKey, email })
    const res = await fetch(`https://emailvalidation.abstractapi.com/v1/?${params}`, {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as any
    const deliverable = data.deliverability === 'DELIVERABLE'
    return {
      smtpCode: deliverable ? '250' : '550',
      deliverable,
      isCatchAll: data.is_catch_all?.value === true,
      isDisposable: data.is_disposable_email?.value === true,
      provider: 'abstractapi',
    }
  } catch {
    return null
  }
}

async function tryNeverBounce(email: string, apiKey: string): Promise<Stage2Result | null> {
  try {
    const params = new URLSearchParams({ key: apiKey, email })
    const res = await fetch(`https://api.neverbounce.com/v4/single/check?${params}`, {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as any
    const deliverable = data.result === 'valid' || data.result === 'catchall'
    return {
      smtpCode: deliverable ? '250' : '550',
      deliverable,
      isCatchAll: data.result === 'catchall',
      isDisposable: data.result === 'disposable',
      provider: 'neverbounce',
    }
  } catch {
    return null
  }
}

async function tryTruemail(email: string, host: string, token: string): Promise<Stage2Result | null> {
  try {
    const res = await fetch(`${host}/api/v1?email=${encodeURIComponent(email)}`, {
      headers: { Authorization: token },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as any
    const result = data.result ?? {}
    const deliverable = result.valid_format && result.mx_found && result.smtp_debug?.[0]?.port_opened
    return {
      smtpCode: deliverable ? '250' : '550',
      deliverable: !!deliverable,
      isCatchAll: false,
      isDisposable: false,
      provider: 'truemail',
    }
  } catch {
    return null
  }
}

export async function runStage2(
  email: string,
  apiKeys: {
    mailcheck?: string
    zerobounce?: string
    millionverifier?: string
    abstractapi?: string
    neverbounce?: string
    truemailHost?: string
    truemailToken?: string
  },
): Promise<Stage2Result> {
  if (apiKeys.mailcheck) {
    const result = await tryMailcheck(email, apiKeys.mailcheck)
    if (result) return result
  }

  if (apiKeys.zerobounce) {
    const result = await tryZeroBounce(email, apiKeys.zerobounce)
    if (result) return result
  }

  if (apiKeys.millionverifier) {
    const result = await tryMillionVerifier(email, apiKeys.millionverifier)
    if (result) return result
  }

  if (apiKeys.abstractapi) {
    const result = await tryAbstractApi(email, apiKeys.abstractapi)
    if (result) return result
  }

  if (apiKeys.neverbounce) {
    const result = await tryNeverBounce(email, apiKeys.neverbounce)
    if (result) return result
  }

  if (apiKeys.truemailHost && apiKeys.truemailToken) {
    const result = await tryTruemail(email, apiKeys.truemailHost, apiKeys.truemailToken)
    if (result) return result
  }

  return { smtpCode: 'UNKNOWN', deliverable: false, isCatchAll: false, isDisposable: false, provider: 'none' }
}
