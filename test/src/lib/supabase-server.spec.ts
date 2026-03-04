import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getUserFromRequest,
  requireAuthenticatedUser,
  requireAdminFromRequest,
} from '@/lib/supabase-server'
import { cookies } from 'next/headers'

const mockGetUser = vi.fn()
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

function mockRequest(): { nextUrl: { pathname: string }; cookies: { getAll: () => [] } } {
  return {
    nextUrl: { pathname: '/admin' },
    cookies: { getAll: () => [] },
  } as unknown as ReturnType<typeof import('next/server').NextRequest>
}

describe('supabase-server', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    vi.mocked(cookies).mockResolvedValue({
      getAll: () => [],
      set: vi.fn(),
    } as unknown as Awaited<ReturnType<typeof cookies>>)
  })

  it('getUserFromRequest retorna user quando auth.getUser sucesso', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: '1' } },
      error: null,
    })
    const request = mockRequest()
    const user = await getUserFromRequest(request)
    expect(user?.id).toBe('1')
  })

  it('getUserFromRequest retorna null quando error', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'auth error' },
    })
    const request = mockRequest()
    const user = await getUserFromRequest(request)
    expect(user).toBe(null)
  })

  it('getUserFromRequest retorna null em catch', async () => {
    mockGetUser.mockRejectedValue(new Error('network error'))
    const request = mockRequest()
    const user = await getUserFromRequest(request)
    expect(user).toBe(null)
  })

  it('requireAdminFromRequest retorna user quando admin', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: '1',
          app_metadata: { role: 'admin' },
        },
      },
      error: null,
    })
    const request = mockRequest()
    const user = await requireAdminFromRequest(request)
    expect(user).not.toBe(null)
  })

  it('requireAdminFromRequest retorna null quando não autenticado', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })
    const request = mockRequest()
    const user = await requireAdminFromRequest(request)
    expect(user).toBe(null)
  })

  it('requireAdminFromRequest retorna null quando não é admin', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: '1',
          app_metadata: { role: 'user' },
        },
      },
      error: null,
    })
    const request = mockRequest()
    const user = await requireAdminFromRequest(request)
    expect(user).toBe(null)
  })

  it('requireAuthenticatedUser lança quando error', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'auth error' },
    })
    await expect(requireAuthenticatedUser()).rejects.toThrow('Não autorizado')
  })

  it('requireAuthenticatedUser lança quando user não é admin', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: '1',
          app_metadata: { role: 'user' },
        },
      },
      error: null,
    })
    await expect(requireAuthenticatedUser()).rejects.toThrow('Acesso administrativo restrito')
  })
})
