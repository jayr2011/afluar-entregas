import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCartStore, useCartItem } from '@/store/cartStore'
import { Produto } from '@/types/produtos'

const produtoBase: Produto = {
  id: '1',
  nome: 'Pizza',
  descricao: '...',
  preco: 30,
  categoria: 'Pratos',
  destaque: true,
  imagem: '',
}

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart()
  })

  it('items inicia vazio', () => {
    expect(useCartStore.getState().items).toEqual([])
  })

  it('addItem adiciona item novo', () => {
    useCartStore.getState().addItem({ ...produtoBase, quantidade: 1 })
    expect(useCartStore.getState().items).toHaveLength(1)
  })

  it('addItem incrementa quantidade quando item já existe', () => {
    useCartStore.getState().addItem({ ...produtoBase, quantidade: 1 })
    useCartStore.getState().addItem({ ...produtoBase, quantidade: 1 })
    expect(useCartStore.getState().items[0].quantidade).toBe(2)
  })

  it('addProduct adiciona produto com quantidade default 1', () => {
    useCartStore.getState().addProduct(produtoBase)
    expect(useCartStore.getState().items[0].quantidade).toBe(1)
  })

  it('addProduct adiciona com quantidade customizada', () => {
    useCartStore.getState().addProduct(produtoBase, 3)
    expect(useCartStore.getState().items[0].quantidade).toBe(3)
  })

  it('addProduct incrementa quando produto já existe', () => {
    useCartStore.getState().addProduct(produtoBase)
    useCartStore.getState().addProduct(produtoBase)
    expect(useCartStore.getState().items[0].quantidade).toBe(2)
  })

  it('removeItem remove item pelo id', () => {
    useCartStore.getState().addItem({ ...produtoBase, quantidade: 1 })
    useCartStore.getState().removeItem(produtoBase.id)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('updateQuantity com qty > 0 atualiza', () => {
    useCartStore.getState().addItem({ ...produtoBase, quantidade: 1 })
    useCartStore.getState().updateQuantity(produtoBase.id, 5)
    expect(useCartStore.getState().items[0].quantidade).toBe(5)
  })

  it('updateQuantity com qty <= 0 remove item', () => {
    useCartStore.getState().addItem({ ...produtoBase, quantidade: 1 })
    useCartStore.getState().updateQuantity(produtoBase.id, 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('clearCart esvazia items', () => {
    useCartStore.getState().addItem({ ...produtoBase, quantidade: 1 })
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toEqual([])
  })

  it('getTotalItems retorna soma das quantidades', () => {
    useCartStore.getState().addItem({ ...produtoBase, quantidade: 2 })
    useCartStore.getState().addItem({ ...produtoBase, id: '2', nome: 'Refri', quantidade: 3 })
    expect(useCartStore.getState().getTotalItems()).toBe(5)
  })

  it('getTotalPrice retorna preco quantidade', () => {
    useCartStore.getState().addItem({ ...produtoBase, preco: 30, quantidade: 2 })
    expect(useCartStore.getState().getTotalPrice()).toBe(60)
  })

  it('useCartItem retorna item pelo id', () => {
    useCartStore.getState().addItem({ ...produtoBase, quantidade: 1 })
    const { result } = renderHook(() => useCartItem('1'))
    expect(result.current).toMatchObject({ id: '1' })
  })

  it('useCartItem retorna undefined quando id não existe', () => {
    const { result } = renderHook(() => useCartItem('inexistente'))
    expect(result.current).toBeUndefined()
  })
})
