import dns from 'node:dns/promises'

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', '10minutemail.com', 'trashmail.com', 'sharklasers.com',
  'guerrillamailblock.com', 'grr.la', 'guerrillamail.info', 'spam4.me',
  'tempr.email', 'dispostable.com', 'maildrop.cc', 'mailnull.com',
  'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org', 'binkmail.com',
  'bobmail.info', 'chammy.info', 'devnullmail.com', 'discard.email',
  'discardmail.com', 'discardmail.de', 'einrot.com', 'filzmail.com',
  'getonemail.com', 'getonemail.net', 'haltospam.com', 'ieatspam.eu',
  'ieatspam.info', 'jetable.com', 'jetable.fr.nf', 'jetable.net',
  'jetable.org', 'keepmymail.com', 'killmail.com', 'killmail.net',
  'klzlk.com', 'lhsdv.com', 'lifebyfood.com', 'llogin.com',
  'mailexpire.com', 'mailfreeonline.com', 'mailguard.me', 'mailinater.com',
  'mailmetrash.com', 'mailnew.com', 'mailscrap.com', 'mailsiphon.com',
  'mailzilla.com', 'mohmal.com', 'moncourrier.fr.nf', 'monemail.fr.nf',
  'monmail.fr.nf', 'objectmail.com', 'obobbo.com', 'onewaymail.com',
])

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

export interface Stage1Result {
  valid: boolean
  mxRecords: string[]
  isDisposable: boolean
  reason?: string
}

export async function runStage1(email: string): Promise<Stage1Result> {
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, mxRecords: [], isDisposable: false, reason: 'invalid_syntax' }
  }

  const domain = email.split('@')[1].toLowerCase()

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, mxRecords: [], isDisposable: true, reason: 'disposable_domain' }
  }

  try {
    const mxRecords = await dns.resolveMx(domain)
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, mxRecords: [], isDisposable: false, reason: 'no_mx_records' }
    }
    const hosts = mxRecords.sort((a, b) => a.priority - b.priority).map((r) => r.exchange)
    return { valid: true, mxRecords: hosts, isDisposable: false }
  } catch {
    return { valid: false, mxRecords: [], isDisposable: false, reason: 'dns_lookup_failed' }
  }
}
