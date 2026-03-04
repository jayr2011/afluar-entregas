import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createRateLimiter,
  getRateLimitIdentifier,
  checkRateLimit,
  withRateLimit,
  throwIfRateLimited,
} from '@/lib/rate-limit'
import { headers } from 'next/headers'

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('rate-limit', () => {
  beforeEach(() => {
    vi.mocked(headers).mockResolvedValue({
      get: () => null,
    } as unknown as Headers)
  })

  it('createRateLimiter: primeira chamada retorna success true', () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60000 })
    const id = `test-${Date.now()}-${Math.random()}`
    const result = limiter.limit(id)
    expect(result.success).toBe(true)
  })

  it('createRateLimiter: remaining diminui a cada chamada', () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60000 })
    const id = `test-${Date.now()}-${Math.random()}`
    limiter.limit(id)
    const second = limiter.limit(id)
    expect(second.remaining).toBe(1)
  })

  it('createRateLimiter: ao atingir limit retorna success false', () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 60000 })
    const id = `test-${Date.now()}-${Math.random()}`
    limiter.limit(id)
    limiter.limit(id)
    const third = limiter.limit(id)
    expect(third.success).toBe(false)
  })

  it('createRateLimiter: remaining 0 quando limit excedido', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60000 })
    const id = `test-${Date.now()}-${Math.random()}`
    limiter.limit(id)
    const second = limiter.limit(id)
    expect(second.remaining).toBe(0)
  })

  it('getRateLimitIdentifier retorna user:id quando x-user-id presente', async () => {
    vi.mocked(headers).mockResolvedValue({
      get: (name: string) => (name === 'x-user-id' ? '123' : null),
    } as Headers)
    const id = await getRateLimitIdentifier()
    expect(id).toBe('user:123')
  })

  it('getRateLimitIdentifier retorna ip:X quando x-forwarded-for', async () => {
    vi.mocked(headers).mockResolvedValue({
      get: (name: string) => (name === 'x-forwarded-for' ? '192.168.1.1, 10.0.0.1' : null),
    } as Headers)
    const id = await getRateLimitIdentifier()
    expect(id).toMatch(/^ip:/)
  })

  it('checkRateLimit com limiter null retorna success true', async () => {
    const result = await checkRateLimit(null)
    expect(result.success).toBe(true)
  })

  it('checkRateLimit com limiter null retorna remaining -1', async () => {
    const result = await checkRateLimit(null)
    expect(result.remaining).toBe(-1)
  })

  it('checkRateLimit com identifier e limiter usa identifier', async () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 60000 })
    const result = await checkRateLimit(limiter, 'custom-id-123')
    expect(result.success).toBe(true)
  })

  it('withRateLimit retorna null quando dentro do limit', async () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 60000 })
    const result = await withRateLimit(limiter, `id-${Date.now()}`)
    expect(result).toBe(null)
  })

  it('withRateLimit retorna Response 429 quando limit excedido', async () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60000 })
    const id = `id-${Date.now()}-${Math.random()}`
    limiter.limit(id)
    const result = await withRateLimit(limiter, id)
    expect(result?.status).toBe(429)
  })

  it('throwIfRateLimited lança quando limit excedido', async () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60000 })
    const id = `id-${Date.now()}-${Math.random()}`
    limiter.limit(id)
    await expect(throwIfRateLimited(limiter, id)).rejects.toThrow('Too many requests')
  })
})
