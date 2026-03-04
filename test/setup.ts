import { beforeEach, vi } from 'vitest'
import { useProductsStore } from '@/store/productsStore'

if (typeof window !== 'undefined') {
  if (!window.ResizeObserver) {
    class ResizeObserverMock {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
    window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
  }
  if (!window.IntersectionObserver) {
    class IntersectionObserverMock {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
      root = null
      rootMargin = ''
      thresholds: number[] = []
      takeRecords = vi.fn().mockReturnValue([])
    }
    window.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver
  }
}

beforeEach(() => {
  useProductsStore.setState({ products: new Map() })
})
