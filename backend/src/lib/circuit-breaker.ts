import { ServiceUnavailableError } from './errors.js'

type CBState = 'closed' | 'open' | 'half-open'

interface CBOpts {
  failureThreshold: number
  successThreshold: number
  timeoutMs: number
  requestTimeoutMs: number
}

const DEFAULT_OPTS: CBOpts = {
  failureThreshold: 5,
  successThreshold: 2,
  timeoutMs: 60000,
  requestTimeoutMs: 5000,
}

export class CircuitBreaker {
  private state: CBState = 'closed'
  private failures = 0
  private successes = 0
  private openedAt = 0
  private opts: CBOpts

  constructor(public readonly name: string, opts?: Partial<CBOpts>) {
    this.opts = { ...DEFAULT_OPTS, ...opts }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.openedAt < this.opts.timeoutMs) {
        throw new ServiceUnavailableError('Circuit open for ' + this.name)
      }
      this.state = 'half-open'
      this.successes = 0
    }

    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), this.opts.requestTimeoutMs)),
      ])
      this.onSuccess()
      return result
    } catch (err) {
      this.onFailure()
      throw err
    }
  }

  private onSuccess() {
    this.failures = 0
    if (this.state === 'half-open') {
      this.successes++
      if (this.successes >= this.opts.successThreshold) this.state = 'closed'
    }
  }

  private onFailure() {
    this.failures++
    if (this.state === 'half-open') {
      this.state = 'open'
      this.openedAt = Date.now()
      return
    }
    if (this.failures >= this.opts.failureThreshold) {
      this.state = 'open'
      this.openedAt = Date.now()
    }
  }

  getState() {
    return { name: this.name, state: this.state, failures: this.failures, successes: this.successes }
  }
}

const registry = new Map<string, CircuitBreaker>()

export function getBreaker(name: string, opts?: Partial<CBOpts>): CircuitBreaker {
  if (!registry.has(name)) registry.set(name, new CircuitBreaker(name, opts))
  return registry.get(name)!
}
