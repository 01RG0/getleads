import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'

export interface TechDetectResult {
  domain: string
  technologies: string[]
  categories: string[]
  cms?: string
  server?: string
}

async function callWhatwebService(domain: string, workerUrl: string): Promise<TechDetectResult> {
  const res = await fetch(workerUrl + '/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://' + domain }),
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error('whatweb error ' + res.status)

  const data = await res.json() as {
    technologies?: string[]
    categories?: string[]
    cms?: string
    server?: string
  }
  return {
    domain,
    technologies: data.technologies ?? [],
    categories: data.categories ?? [],
    cms: data.cms,
    server: data.server,
  }
}

async function callWhatwebLocal(domain: string): Promise<TechDetectResult> {
  return new Promise((resolve, reject) => {
    const outputPath = '/tmp/whatweb_out.json'
    const proc = spawn('whatweb', ['--log-json=' + outputPath, 'https://' + domain], { timeout: 30000 })
    proc.on('close', () => {
      readFile(outputPath, 'utf8').then((raw) => {
        const result = JSON.parse(raw) as Array<{ plugins?: Record<string, unknown> }>
        const technologies = result[0]?.plugins ? Object.keys(result[0].plugins) : []
        resolve({
          domain,
          technologies,
          categories: [],
          cms: technologies.find((technology) =>
            ['WordPress', 'Drupal', 'Joomla', 'Shopify', 'Squarespace', 'Wix'].includes(technology),
          ),
        })
      }).catch(reject)
    })
    proc.on('error', reject)
  })
}

export async function detectTechStack(domain: string): Promise<TechDetectResult | null> {
  const workerUrl = process.env.WHATWEB_WORKER_URL
  if (workerUrl) {
    try {
      return await callWhatwebService(domain, workerUrl)
    } catch {}
  }

  try {
    return await callWhatwebLocal(domain)
  } catch {}

  return null
}
