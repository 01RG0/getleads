export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly type: string,
    message: string,
    public readonly detail?: string,
  ) {
    super(message)
    this.name = this.constructor.name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class ValidationError extends AppError {
  constructor(detail?: string) {
    super(400, 'validation', 'Validation failed', detail)
  }
}

export class UnauthorizedError extends AppError {
  constructor(detail?: string) {
    super(401, 'unauthorized', 'Unauthorized', detail)
  }
}

export class InsufficientCreditsError extends AppError {
  constructor(detail?: string) {
    super(402, 'insufficient-credits', 'Insufficient credits', detail)
  }
}

export class ForbiddenError extends AppError {
  constructor(detail?: string) {
    super(403, 'forbidden', 'Forbidden', detail)
  }
}

export class NotFoundError extends AppError {
  constructor(what?: string) {
    super(404, 'not-found', what ?? 'Not found')
  }
}

export class RateLimitError extends AppError {
  constructor(detail?: string) {
    super(429, 'rate-limit-exceeded', 'Rate limit exceeded', detail)
  }
}

export class ProviderError extends AppError {
  constructor(provider: string, detail?: string) {
    super(502, 'provider-error', 'Provider ' + provider + ' failed', detail)
  }
}

export class WaterfallTimeoutError extends AppError {
  constructor(detail?: string) {
    super(504, 'waterfall-timeout', 'Enrichment waterfall timed out', detail)
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(detail?: string) {
    super(503, 'service-unavailable', 'Service unavailable', detail)
  }
}

export function toRfc7807(err: AppError, instanceUrl: string, requestId?: string): Record<string, unknown> {
  return {
    type: 'https://leadscale.io/errors/' + err.type,
    title: err.message,
    status: err.statusCode,
    detail: err.detail,
    instance: instanceUrl,
    request_id: requestId,
  }
}
