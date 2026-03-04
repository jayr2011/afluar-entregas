import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resolveCartItemsFromDb } from '@/lib/resolveCartItems'

const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockIn = vi.fn()

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({
    from: mockFrom,
  }),
}))

beforeEach(() => {
  mockFrom.mockReturnValue({
    select: mockSelect,
  })
  mockSelect.mockReturnValue({
    in: mockIn,
  })
})

describe('resolveCartItemsFromDb', () => {
  it('lança quando productsError', async () => {
    mockIn.mockResolvedValueOnce({ data: null, error: new Error('db error') })
    await expect(resolveCartItemsFromDb([{ id: '1', quantidade: 1 }])).rejects.toThrow(
      'Produtos não encontrados'
    )
  })

  it('lança quando products vazio', async () => {
    mockIn.mockResolvedValueOnce({ data: [], error: null })
    await expect(resolveCartItemsFromDb([{ id: '1', quantidade: 1 }])).rejects.toThrow(
      'Produtos não encontrados'
    )
  })

  it('lança quando produto do cart não está no DB', async () => {
    mockIn.mockResolvedValueOnce({
      data: [{ id: '1', nome: 'P1', preco: 10 }],
      error: null,
    })
    await expect(
      resolveCartItemsFromDb([
        { id: '1', quantidade: 1 },
        { id: '2', quantidade: 1 },
      ])
    ).rejects.toThrow('Produto não encontrado')
  })

  it('retorna items e total corretos', async () => {
    mockIn.mockResolvedValueOnce({
      data: [
        { id: '1', nome: 'Pizza', preco: 30 },
        { id: '2', nome: 'Refri', preco: 5 },
      ],
      error: null,
    })
    const result = await resolveCartItemsFromDb([
      { id: '1', quantidade: 2 },
      { id: '2', quantidade: 1 },
    ])
    expect(result.items).toHaveLength(2)
  })

  it('calcula total corretamente', async () => {
    mockIn.mockResolvedValueOnce({
      data: [{ id: '1', nome: 'Pizza', preco: 30 }],
      error: null,
    })
    const result = await resolveCartItemsFromDb([{ id: '1', quantidade: 2 }])
    expect(result.total).toBe(60)
  })

  it('clampa quantidade em MIN_QTY', async () => {
    mockIn.mockResolvedValueOnce({
      data: [{ id: '1', nome: 'Pizza', preco: 30 }],
      error: null,
    })
    const result = await resolveCartItemsFromDb([{ id: '1', quantidade: 0 }])
    expect(result.items[0].quantidade).toBe(1)
  })

  it('clampa quantidade em MAX_QTY', async () => {
    mockIn.mockResolvedValueOnce({
      data: [{ id: '1', nome: 'Pizza', preco: 30 }],
      error: null,
    })
    const result = await resolveCartItemsFromDb([{ id: '1', quantidade: 100 }])
    expect(result.items[0].quantidade).toBe(50)
  })
})
