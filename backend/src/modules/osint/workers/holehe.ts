import { spawn } from 'node:child_process'

export interface HoleheResult {
  email: string
  registered_platforms: string[]
  platform_count: number
  is_real_person: boolean
}

const emptyResult = (email: string): HoleheResult => ({
  email,
  registered_platforms: [],
  platform_count: 0,
  is_real_person: false,
})

async function callHoleheService(email: string, workerUrl: string): Promise<HoleheResult> {
  const res = await fetch(`${workerUrl}/verify/social-presence?email=${encodeURIComponent(email)}`, {
    signal: AbortSignal.timeout(60000),
  })
  if (!res.ok) throw new Error(`holehe service error: ${res.status}`)

  const data = (await res.json()) as {
    platforms?: string[]
    registered_platforms_count?: number
    is_highly_probable_real_person?: boolean
  }
  return {
    email,
    registered_platforms: data.platforms ?? [],
    platform_count: data.registered_platforms_count ?? 0,
    is_real_person: data.is_highly_probable_real_person ?? false,
  }
}

async function callHoleheLocal(email: string): Promise<HoleheResult> {
  return new Promise((resolve) => {
    const proc = spawn('holehe', ['--json', email], { timeout: 60000 })
    let out = ''
    proc.stdout.on('data', (data: Buffer) => { out += data.toString() })
    proc.on('close', () => {
      try {
        const parsed: unknown = JSON.parse(out.trim())
        const platforms = Array.isArray(parsed)
          ? parsed
              .filter((platform: unknown): platform is { exists?: boolean; name?: string } =>
                typeof platform === 'object' && platform !== null,
              )
              .filter((platform) => platform.exists && typeof platform.name === 'string')
              .map((platform) => platform.name as string)
          : []
        resolve({ email, registered_platforms: platforms, platform_count: platforms.length, is_real_person: platforms.length >= 2 })
      } catch {
        resolve(emptyResult(email))
      }
    })
    proc.on('error', () => resolve(emptyResult(email)))
  })
}

export async function checkSocialPresence(email: string): Promise<HoleheResult | null> {
  const workerUrl = process.env.HOLEHE_WORKER_URL
  if (workerUrl) {
    try {
      return await callHoleheService(email, workerUrl)
    } catch {}
  }
  try {
    return await callHoleheLocal(email)
  } catch {}
  return null
}
