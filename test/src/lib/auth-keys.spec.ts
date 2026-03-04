import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { requireAdminApiKey } from '@/lib/auth-keys'
import type { NextRequest } from 'next/server'

function mockRequest(apiKey: string | null): NextRequest {
  return {
    headers: {
      get: (name: string) => (name === 'x-api-key' ? apiKey : null),
    },
  } as unknown as NextRequest
}

describe('requireAdminApiKey', () => {
  const VALID_KEY = 'secret-key-123'

  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs?.()
  })

  afterEach(() => {
    vi.unstubAllEnvs?.()
  })

  it('retorna false quando ADMIN_API_KEY não está definido', () => {
    delete process.env.ADMIN_API_KEY
    const req = mockRequest(VALID_KEY)
    expect(requireAdminApiKey(req)).toBe(false)
  })

  it('retorna false quando header x-api-key está ausente', () => {
    process.env.ADMIN_API_KEY = VALID_KEY
    const req = mockRequest(null)
    expect(requireAdminApiKey(req)).toBe(false)
  })

  it('retorna false quando key tem tamanho diferente do esperado', () => {
    process.env.ADMIN_API_KEY = VALID_KEY
    const req = mockRequest('short')
    expect(requireAdminApiKey(req)).toBe(false)
  })

  it('retorna false quando key incorreta com mesmo tamanho', () => {
    process.env.ADMIN_API_KEY = VALID_KEY
    const req = mockRequest('xxxxxxxxxxxxx')
    expect(requireAdminApiKey(req)).toBe(false)
  })

  it('retorna true quando key é idêntica', () => {
    process.env.ADMIN_API_KEY = VALID_KEY
    const req = mockRequest(VALID_KEY)
    expect(requireAdminApiKey(req)).toBe(true)
  })
})
