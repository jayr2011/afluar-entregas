import { describe, it, expect } from 'vitest'
import { checkoutFormSchema, checkoutFormClientSchema } from '@/lib/validations/checkout'

const validData = {
  nome: 'João Silva',
  whatsapp: '11999998888',
  rua: 'Rua das Flores',
  numero: '123',
  bairro: 'Centro',
}

describe('checkoutFormSchema', () => {
  it('dados válidos passam', () => {
    expect(checkoutFormSchema.parse(validData)).toBeDefined()
  })

  it('nome com menos de 3 falha', () => {
    expect(checkoutFormSchema.safeParse({ ...validData, nome: 'ab' }).success).toBe(false)
  })

  it('nome com mais de 100 falha', () => {
    expect(
      checkoutFormSchema.safeParse({
        ...validData,
        nome: 'x'.repeat(101),
      }).success
    ).toBe(false)
  })

  it('whatsapp formato inválido falha', () => {
    expect(checkoutFormSchema.safeParse({ ...validData, whatsapp: 'abc' }).success).toBe(false)
  })

  it('whatsapp com dígitos incorretos falha', () => {
    expect(checkoutFormSchema.safeParse({ ...validData, whatsapp: '123' }).success).toBe(false)
  })

  it('rua curta falha', () => {
    expect(checkoutFormSchema.safeParse({ ...validData, rua: 'ab' }).success).toBe(false)
  })

  it('numero vazio falha', () => {
    expect(checkoutFormSchema.safeParse({ ...validData, numero: '' }).success).toBe(false)
  })

  it('bairro curto falha', () => {
    expect(checkoutFormSchema.safeParse({ ...validData, bairro: 'a' }).success).toBe(false)
  })

  it('transform aplica trim no nome', () => {
    expect(checkoutFormSchema.parse({ ...validData, nome: '  João  ' }).nome).toBe('João')
  })

  it('complemento é opcional', () => {
    expect(
      checkoutFormSchema.parse({ ...validData, complemento: undefined }).complemento
    ).toBeUndefined()
  })
})

describe('checkoutFormClientSchema', () => {
  const validClientData = {
    ...validData,
    complemento: '',
  }

  it('dados válidos passam', () => {
    expect(checkoutFormClientSchema.parse(validClientData)).toBeDefined()
  })

  it('trim antes da validação', () => {
    expect(checkoutFormClientSchema.parse({ ...validClientData, nome: '  Maria  ' }).nome).toBe(
      'Maria'
    )
  })
})
