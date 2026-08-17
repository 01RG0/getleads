import { spawn } from 'node:child_process'

export interface PhoneInfogaResult {
  number: string
  country: string
  carrier: string
  line_type: string
  valid: boolean
  local: Record<string, unknown>
}

async function callPhoneinfogaService(phone: string, workerUrl: string): Promise<PhoneInfogaResult> {
  const encoded = encodeURIComponent(phone)
  const res = await fetch(workerUrl + '/api/v2/numbers/' + encoded + '/scan/local', {
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error('phoneinfoga error ' + res.status)

  const data = await res.json() as {
    PhoneNumber?: { Country?: string; Carrier?: string; LineType?: string; RawLocal?: { Valid?: boolean } }
    Local?: Record<string, unknown>
  }
  const pn = data.PhoneNumber ?? {}
  return {
    number: phone,
    country: pn.Country ?? '',
    carrier: pn.Carrier ?? '',
    line_type: pn.LineType ?? 'Unknown',
    valid: pn.RawLocal?.Valid ?? false,
    local: data.Local ?? {},
  }
}

async function callPhoneinfogaLocal(phone: string): Promise<PhoneInfogaResult> {
  return new Promise((resolve, reject) => {
    const proc = spawn('phoneinfoga', ['scan', '-n', phone, '--output', 'json'], { timeout: 30000 })
    let out = ''
    proc.stdout.on('data', (data: Buffer) => { out += data.toString() })
    proc.on('close', () => {
      try {
        const result = JSON.parse(out) as Partial<PhoneInfogaResult>
        resolve({
          number: phone,
          country: result.country ?? '',
          carrier: result.carrier ?? '',
          line_type: result.line_type ?? 'Unknown',
          valid: result.valid ?? false,
          local: result.local ?? {},
        })
      } catch {
        reject(new Error('phoneinfoga parse error'))
      }
    })
    proc.on('error', reject)
  })
}

export async function lookupPhone(phone: string): Promise<PhoneInfogaResult | null> {
  const workerUrl = process.env.PHONEINFOGA_WORKER_URL
  if (workerUrl) {
    try {
      return await callPhoneinfogaService(phone, workerUrl)
    } catch {}
  }

  try {
    return await callPhoneinfogaLocal(phone)
  } catch {}

  return null
}
