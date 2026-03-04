import { describe, it, expect } from 'vitest'
import { cn, formatPrice } from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('concatena classes', () => {
      expect(cn('a', 'b')).toContain('a')
    })

    it('ignora valores falsy', () => {
      expect(cn('a', false, 'b')).not.toContain('false')
    })
  })

  describe('formatPrice', () => {
    it('formata em BRL', () => {
      expect(formatPrice(10)).toMatch(/R\s?\$|R\$/)
    })

    it('formata centavos', () => {
      expect(formatPrice(10.5)).toContain(',')
    })

    it('retorna string', () => {
      expect(typeof formatPrice(0)).toBe('string')
    })
  })
})
