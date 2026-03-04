import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  isFeatureToggleKey,
  getFeatureToggles,
  getFeatureTogglesMap,
  getMultipleFeatureToggles,
  isFeatureEnabled,
} from '@/lib/feature-toggles'

const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockIn = vi.fn()

vi.mock('next/cache', () => ({
  cacheTag: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}))

vi.mock('@/lib/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

beforeEach(() => {
  mockFrom.mockReturnValue({
    select: mockSelect,
  })
  mockSelect.mockReturnValue({
    in: mockIn,
  })
})

describe('feature-toggles', () => {
  it('isFeatureToggleKey retorna true para checkout_enabled', () => {
    expect(isFeatureToggleKey('checkout_enabled')).toBe(true)
  })

  it('isFeatureToggleKey retorna true para blog_enabled', () => {
    expect(isFeatureToggleKey('blog_enabled')).toBe(true)
  })

  it('isFeatureToggleKey retorna false para string inválida', () => {
    expect(isFeatureToggleKey('invalid')).toBe(false)
  })

  it('getFeatureToggles retorna array com enabled por key', async () => {
    mockIn.mockResolvedValueOnce({
      data: [{ key: 'checkout_enabled', enabled: true, updated_at: null }],
      error: null,
    })
    const result = await getFeatureToggles()
    expect(result[0].enabled).toBe(true)
  })

  it('getFeatureToggles lança quando supabase retorna error', async () => {
    mockIn.mockResolvedValueOnce({
      data: null,
      error: { message: 'db error' },
    })
    await expect(getFeatureToggles()).rejects.toEqual({ message: 'db error' })
  })

  it('getFeatureTogglesMap retorna Map com boolean por key', async () => {
    mockIn.mockResolvedValueOnce({
      data: [{ key: 'checkout_enabled', enabled: false, updated_at: null }],
      error: null,
    })
    const result = await getFeatureTogglesMap()
    expect(result.get('checkout_enabled')).toBe(false)
  })

  it('getMultipleFeatureToggles retorna objeto com keys passadas', async () => {
    mockIn.mockResolvedValue({
      data: [],
      error: null,
    })
    const result = await getMultipleFeatureToggles(['checkout_enabled'])
    expect(result).toMatchObject({ checkout_enabled: false })
  })

  it('isFeatureEnabled retorna boolean conforme toggle', async () => {
    mockIn.mockResolvedValue({
      data: [{ key: 'blog_enabled', enabled: false, updated_at: null }],
      error: null,
    })
    const result = await isFeatureEnabled('blog_enabled')
    expect(result).toBe(false)
  })
})
