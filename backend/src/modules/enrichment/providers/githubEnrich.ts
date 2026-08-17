import { getBreaker } from '../../../lib/circuit-breaker.js'

export interface GitHubEnrichResult {
  githubUsername?: string
  githubName?: string
  githubBio?: string
  githubPublicRepos?: number
}

export async function githubEnrich(email: string): Promise<GitHubEnrichResult | null> {
  const token = process.env.GITHUB_TOKEN
  if (!token) return null

  return getBreaker('github-enrich', { requestTimeoutMs: 8000 }).execute(async () => {
    const res = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(email)}+in:email&per_page=1`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    })
    if (!res.ok) return null
    const json = await res.json() as { total_count?: number; items?: Array<{ login: string }> }
    if (!json.items?.length) return null

    const user = json.items[0]
    const profileRes = await fetch(`https://api.github.com/users/${user.login}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    })
    if (!profileRes.ok) return { githubUsername: user.login }
    const profile = await profileRes.json() as { login: string; name?: string; bio?: string; public_repos?: number }
    return { githubUsername: profile.login, githubName: profile.name, githubBio: profile.bio, githubPublicRepos: profile.public_repos }
  }).catch(() => null)
}
