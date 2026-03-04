import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProdutosService } from '@/services/productsService'

const mockFrom = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}))

vi.mock('@/lib/logger', () => ({
  default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

beforeEach(() => {
  mockFrom.mockReturnValue({
    select: vi.fn().mockResolvedValue({ data: [], error: null }),
  })
})

describe('ProdutosService', () => {
  it('findAll retorna array de produtos', async () => {
    const produtos = [{ id: '1', nome: 'Pizza', preco: 30 }]
    mockFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: produtos, error: null }),
    })
    const result = await new ProdutosService().findAll()
    expect(result).toEqual(produtos)
  })

  it('findAll lança quando supabase retorna error', async () => {
    const err = new Error('db error')
    mockFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: null, error: err }),
    })
    await expect(new ProdutosService().findAll()).rejects.toThrow('db error')
  })

  it('findById retorna produto quando existe', async () => {
    const produto = { id: '1', nome: 'Pizza', preco: 30 }
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [produto], error: null }),
      }),
    })
    const result = await new ProdutosService().findById('1')
    expect(result).toEqual(produto)
  })

  it('findById retorna null quando não existe', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    })
    const result = await new ProdutosService().findById('1')
    expect(result).toBeNull()
  })

  it('findById lança quando supabase retorna error', async () => {
    const err = new Error('db error')
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: err }),
      }),
    })
    await expect(new ProdutosService().findById('1')).rejects.toThrow('db error')
  })

  it('findByCategoria retorna produtos da categoria', async () => {
    const produtos = [{ id: '1', nome: 'Pizza', categoria: 'Pratos' }]
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: produtos, error: null }),
      }),
    })
    const result = await new ProdutosService().findByCategoria('Pratos')
    expect(result).toEqual(produtos)
  })

  it('findByCategoria lança quando supabase retorna error', async () => {
    const err = new Error('db error')
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: err }),
      }),
    })
    await expect(new ProdutosService().findByCategoria('Pratos')).rejects.toThrow('db error')
  })

  it('findDestaques retorna produtos em destaque', async () => {
    const produtos = [{ id: '1', nome: 'Pizza', destaque: true }]
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: produtos, error: null }),
      }),
    })
    const result = await new ProdutosService().findDestaques()
    expect(result).toEqual(produtos)
  })

  it('findDestaques lança quando supabase retorna error', async () => {
    const err = new Error('db error')
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: err }),
      }),
    })
    await expect(new ProdutosService().findDestaques()).rejects.toThrow('db error')
  })

  it('findAllPaginated retorna produtos paginados', async () => {
    const produtos = [{ id: '1', nome: 'A' }]
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        range: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: produtos, error: null }),
        }),
      }),
    })
    const result = await new ProdutosService().findAllPaginated(0, 10)
    expect(result).toEqual(produtos)
  })

  it('findAllPaginated lança quando supabase retorna error', async () => {
    const err = new Error('db error')
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        range: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: err }),
        }),
      }),
    })
    await expect(new ProdutosService().findAllPaginated(0, 10)).rejects.toThrow('db error')
  })

  it('countAll retorna total de produtos', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ count: 42, error: null }),
    })
    const result = await new ProdutosService().countAll()
    expect(result).toBe(42)
  })

  it('countAll retorna 0 quando count é null', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ count: null, error: null }),
    })
    const result = await new ProdutosService().countAll()
    expect(result).toBe(0)
  })

  it('countAll lança quando supabase retorna error', async () => {
    const err = new Error('db error')
    mockFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ count: null, error: err }),
    })
    await expect(new ProdutosService().countAll()).rejects.toThrow('db error')
  })

  it('findByCategoriaPaginated retorna produtos da categoria paginados', async () => {
    const produtos = [{ id: '1', categoria: 'Pratos' }]
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          range: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: produtos, error: null }),
          }),
        }),
      }),
    })
    const result = await new ProdutosService().findByCategoriaPaginated('Pratos', 0, 10)
    expect(result).toEqual(produtos)
  })

  it('findByCategoriaPaginated lança quando supabase retorna error', async () => {
    const err = new Error('db error')
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          range: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: err }),
          }),
        }),
      }),
    })
    await expect(new ProdutosService().findByCategoriaPaginated('Pratos', 0, 10)).rejects.toThrow(
      'db error'
    )
  })

  it('countByCategoria retorna total da categoria', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
      }),
    })
    const result = await new ProdutosService().countByCategoria('Pratos')
    expect(result).toBe(5)
  })

  it('countByCategoria lança quando supabase retorna error', async () => {
    const err = new Error('db error')
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: null, error: err }),
      }),
    })
    await expect(new ProdutosService().countByCategoria('Pratos')).rejects.toThrow('db error')
  })

  it('create insere e retorna produto criado', async () => {
    const produto = {
      id: '1',
      nome: 'Pizza',
      descricao: '',
      preco: 30,
      categoria: 'Pratos',
      destaque: false,
      imagem: '',
    }
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: produto, error: null }),
        }),
      }),
    })
    const result = await new ProdutosService().create({
      nome: 'Pizza',
      descricao: '',
      preco: 30,
      categoria: 'Pratos',
      destaque: false,
      imagem: '',
    })
    expect(result).toEqual(produto)
  })

  it('create lança quando supabase retorna error', async () => {
    const err = new Error('db error')
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: err }),
        }),
      }),
    })
    await expect(
      new ProdutosService().create({
        nome: 'Pizza',
        descricao: '',
        preco: 30,
        categoria: 'Pratos',
        destaque: false,
        imagem: '',
      })
    ).rejects.toThrow('db error')
  })

  it('update retorna produto atualizado', async () => {
    const produto = { id: '1', nome: 'Pizza Nova', preco: 35 }
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: produto, error: null }),
          }),
        }),
      }),
    })
    const result = await new ProdutosService().update('1', { nome: 'Pizza Nova', preco: 35 })
    expect(result).toEqual(produto)
  })

  it('update retorna null quando data é null', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    })
    const result = await new ProdutosService().update('1', { nome: 'X' })
    expect(result).toBeNull()
  })

  it('update lança quando supabase retorna error', async () => {
    const err = new Error('db error')
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: err }),
          }),
        }),
      }),
    })
    await expect(new ProdutosService().update('1', { nome: 'X' })).rejects.toThrow('db error')
  })

  it('delete retorna true quando sucesso', async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })
    const result = await new ProdutosService().delete('1')
    expect(result).toBe(true)
  })

  it('delete lança quando supabase retorna error', async () => {
    const err = new Error('db error')
    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: err }),
      }),
    })
    await expect(new ProdutosService().delete('1')).rejects.toThrow('db error')
  })
})
