import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const mockFrom = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: mockFrom, auth: {} })),
}))

vi.mock('@/lib/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('supabase', () => {
  const url = 'https://test.supabase.co'
  const anonKey = 'test-anon-key'

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = url
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = anonKey
    vi.resetModules()
    vi.mocked(createClient).mockClear()
  })

  it('supabase delega para createClient quando env definido', async () => {
    const { supabase: sb } = await import('@/lib/supabase')
    void sb.from
    expect(createClient).toHaveBeenCalled()
  })

  it('getSupabaseAdmin lança no cliente (jsdom)', async () => {
    const { getSupabaseAdmin: getAdmin } = await import('@/lib/supabase')
    expect(() => getAdmin()).toThrow('só pode ser usada no servidor')
  })

  it('createClient recebe url e anonKey quando env presente', async () => {
    const { supabase: sb } = await import('@/lib/supabase')
    void sb.auth
    expect(createClient).toHaveBeenCalledWith(url, anonKey, expect.any(Object))
  })

  it('getSupabaseAdmin requer SUPABASE_SERVICE_ROLE_KEY no server', async () => {
    const originalWindow = globalThis.window
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      configurable: true,
      writable: true,
    })
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const { getSupabaseAdmin: getAdmin } = await import('@/lib/supabase')
    expect(() => getAdmin()).toThrow('SUPABASE_SERVICE_ROLE_KEY não está definida')
    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      configurable: true,
      writable: true,
    })
  })
})
