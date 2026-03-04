import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useProductsStore } from '@/store/productsStore'
import { Produto } from '@/types/produtos'

vi.mock('@/lib/logger', () => ({ default: { debug: vi.fn(), info: vi.fn() } }))

const produtoBase: Produto = {
  id: '1',
  nome: 'Pizza',
  descricao: '...',
  preco: 30,
  categoria: 'Pratos',
  destaque: true,
  imagem: '',
}

describe('productsStore', () => {
  it('products inicia como Map vazio', () => {
    expect(useProductsStore.getState().products.size).toBe(0)
  })

  it('setProducts adiciona produtos', () => {
    const p1 = { ...produtoBase, id: '1' }
    const p2 = { ...produtoBase, id: '2', nome: 'Refri' }
    useProductsStore.getState().setProducts([p1, p2])
    expect(useProductsStore.getState().products.size).toBe(2)
  })

  it('setProducts substitui produto com mesmo id', () => {
    const p1 = { ...produtoBase }
    const p1Atualizado = { ...produtoBase, nome: 'Pizza Grande' }
    useProductsStore.getState().setProducts([p1])
    useProductsStore.getState().setProducts([p1Atualizado])
    expect(useProductsStore.getState().getProductById('1')?.nome).toBe('Pizza Grande')
  })

  it('setProduct adiciona produto novo', () => {
    useProductsStore.getState().setProduct(produtoBase)
    expect(useProductsStore.getState().products.has('1')).toBe(true)
  })

  it('setProduct atualiza produto existente', () => {
    useProductsStore.getState().setProduct(produtoBase)
    useProductsStore.getState().setProduct({ ...produtoBase, nome: 'Novo' })
    expect(useProductsStore.getState().getProductById('1')?.nome).toBe('Novo')
  })

  it('getProductById retorna produto quando existe', () => {
    useProductsStore.getState().setProduct(produtoBase)
    expect(useProductsStore.getState().getProductById('1')).toMatchObject({ id: '1' })
  })

  it('getProductById retorna undefined quando não existe', () => {
    expect(useProductsStore.getState().getProductById('inexistente')).toBeUndefined()
  })
})
