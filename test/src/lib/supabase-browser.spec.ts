import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createBrowserClient } from '@supabase/ssr'

const mockFrom = vi.fn()
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ from: mockFrom, auth: {} })),
}))

describe('supabase-browser', () => {
  const url = 'https://test.supabase.co'
  const anonKey = 'test-anon-key'

  beforeEach(async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = url
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = anonKey
    vi.resetModules()
    vi.mocked(createBrowserClient).mockClear()
    await import('@/lib/supabase-browser')
  })

  it('supabaseBrowser delega para createBrowserClient ao acessar propriedade', async () => {
    const { supabaseBrowser } = await import('@/lib/supabase-browser')
    void supabaseBrowser.from
    expect(createBrowserClient).toHaveBeenCalled()
  })

  it('createBrowserClient é chamado com URL e anon key do env', async () => {
    const { supabaseBrowser } = await import('@/lib/supabase-browser')
    void supabaseBrowser.auth
    expect(createBrowserClient).toHaveBeenCalledWith(url, anonKey)
  })

  it('proxy retorna valor do client interno', async () => {
    const { supabaseBrowser } = await import('@/lib/supabase-browser')
    expect(supabaseBrowser.from).toBe(mockFrom)
  })
})
