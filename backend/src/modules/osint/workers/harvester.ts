import { execFile } from 'node:child_process'
import { readFile, unlink } from 'node:fs/promises'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const TIMEOUT_MS = 30000

async function isHarvesterInstalled(): Promise<boolean> {
  try {
    await execFileAsync('which', ['theHarvester'], { timeout: 3000 })
    return true
  } catch {
    return false
  }
}

export async function runHarvester(domain: string): Promise<{ emails: string[]; sources: string[] }> {
  if (!(await isHarvesterInstalled())) return { emails: [], sources: [] }

  const outFile = `/tmp/harvest_${domain.replace(/[^a-z0-9]/gi, '_')}`
  try {
    await execFileAsync(
      'theHarvester',
      ['-d', domain, '-b', 'google,bing,duckduckgo', '-f', outFile, '--json'],
      { timeout: TIMEOUT_MS },
    )

    const raw = await readFile(`${outFile}.json`, 'utf-8').catch(() => null)
    await unlink(`${outFile}.json`).catch(() => undefined)

    if (!raw) return { emails: [], sources: [] }
    const parsed = JSON.parse(raw)
    const emails: string[] = [...new Set<string>((parsed.emails ?? []).map((e: any) => String(e).toLowerCase()))]
    const sources: string[] = parsed.interesting_urls ?? []
    return { emails, sources }
  } catch {
    return { emails: [], sources: [] }
  }
}
