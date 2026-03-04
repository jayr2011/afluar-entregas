import { describe, it, expect, vi, beforeEach } from 'vitest'
import { proxy } from '@/proxy'
import type { NextRequest } from 'next/server'

const mockGetUser = vi.fn()
const mockNextResponse = { _type: 'next' }
const mockRedirectResponse = (url: URL) => ({ _type: 'redirect' as const, url })

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => mockNextResponse),
    redirect: vi.fn((url: URL) => mockRedirectResponse(url)),
  },
}))

vi.mock('@/lib/logger', () => ({
  default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

function mockRequest(
  opts: {
    pathname?: string
    method?: string
    headers?: Record<string, string>
  } = {}
) {
  const { pathname = '/', method = 'GET', headers = {} } = opts
  const url = new URL(`https://example.com${pathname}`)
  const cookiesMap = new Map<string, string>()
  return {
    nextUrl: Object.assign(url, {
      clone: () => {
        const u = new URL(url.toString())
        return u
      },
    }),
    method,
    headers: { get: (n: string) => headers[n] ?? null },
    cookies: {
      getAll: () => Array.from(cookiesMap.entries()).map(([name, value]) => ({ name, value })),
      set: (name: string, value: string) => {
        cookiesMap.set(name, value)
      },
    },
  } as unknown as NextRequest
}

describe('proxy', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
  })

  it('retorna supabaseResponse quando path não começa com /admin', async () => {
    const request = mockRequest({ pathname: '/' })
    const response = await proxy(request)
    expect((response as unknown as { _type?: string })._type).toBe('next')
  })

  it('retorna supabaseResponse quando path é exatamente /admin', async () => {
    const request = mockRequest({ pathname: '/admin' })
    const response = await proxy(request)
    expect((response as unknown as { _type?: string })._type).toBe('next')
  })

  it('redireciona para /admin quando path é /admin/dashboard e user é null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const request = mockRequest({ pathname: '/admin/dashboard' })
    const response = (await proxy(request)) as unknown as { _type?: string; url?: URL }
    expect(response._type).toBe('redirect')
    expect(response.url?.pathname).toBe('/admin')
  })

  it('redireciona quando path é /admin/x e user não é admin', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: '1', app_metadata: { role: 'user' } },
      },
      error: null,
    })
    const request = mockRequest({ pathname: '/admin/produtos' })
    const response = (await proxy(request)) as unknown as { _type?: string; url?: URL }
    expect(response._type).toBe('redirect')
    expect(response.url?.pathname).toBe('/admin')
  })

  it('retorna supabaseResponse quando path é /admin/x e user é admin', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: '1', app_metadata: { role: 'admin' } },
      },
      error: null,
    })
    const request = mockRequest({ pathname: '/admin/dashboard' })
    const response = await proxy(request)
    expect((response as unknown as { _type?: string })._type).toBe('next')
  })

  it('retorna supabaseResponse quando getUser retorna error', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'auth error' },
    })
    const request = mockRequest({ pathname: '/' })
    const response = await proxy(request)
    expect((response as unknown as { _type?: string })._type).toBe('next')
  })

  it('retorna supabaseResponse em catch quando getUser lança', async () => {
    mockGetUser.mockRejectedValue(new Error('network error'))
    const request = mockRequest({ pathname: '/admin/dashboard' })
    const response = await proxy(request)
    expect((response as unknown as { _type?: string })._type).toBe('next')
  })

  it('getAll dos cookies é passado ao createServerClient', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    const request = mockRequest()
    await proxy(request)
    const call = vi.mocked(createServerClient).mock.calls[0]
    const cookieOpts = call[2]
    expect(cookieOpts?.cookies?.getAll).toBeDefined()
  })
})
