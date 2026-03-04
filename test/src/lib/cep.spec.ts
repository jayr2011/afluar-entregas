import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buscarEnderecoPorCep } from '@/lib/cep'

vi.mock('@/lib/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('buscarEnderecoPorCep', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('retorna null quando CEP tem menos de 8 dígitos', async () => {
    const result = await buscarEnderecoPorCep('12345')
    expect(result).toBe(null)
  })

  it('retorna null quando CEP tem mais de 8 dígitos', async () => {
    const result = await buscarEnderecoPorCep('123456789')
    expect(result).toBe(null)
  })

  it('retorna null quando fetch retorna res.ok = false', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response)

    const result = await buscarEnderecoPorCep('01310100')

    expect(result).toBe(null)
  })

  it('retorna null quando data.erro === true', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ erro: true }),
    } as Response)

    const result = await buscarEnderecoPorCep('01310100')

    expect(result).toBe(null)
  })

  it('retorna EnderecoPorCep quando sucesso', async () => {
    const mockData = {
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP',
    }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response)

    const result = await buscarEnderecoPorCep('01310100')

    expect(result).toMatchObject({
      cep: mockData.cep,
      logradouro: mockData.logradouro,
      bairro: mockData.bairro,
      localidade: mockData.localidade,
      uf: mockData.uf,
    })
  })

  it('retorna null em caso de exceção no fetch', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const result = await buscarEnderecoPorCep('01310100')

    expect(result).toBe(null)
  })

  it('remove caracteres não-dígitos antes de validar', async () => {
    const mockData = {
      cep: '01310-100',
      logradouro: 'Rua',
      bairro: 'Centro',
      localidade: 'São Paulo',
      uf: 'SP',
    }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response)

    const result = await buscarEnderecoPorCep('12345-678')

    expect(result).not.toBe(null)
    expect(fetch).toHaveBeenCalledWith('https://viacep.com.br/ws/12345678/json/')
  })

  it('preenche campos ausentes na resposta com string vazia', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          cep: '01310-100',
          logradouro: 'Av Paulista',
          bairro: undefined,
          localidade: 'São Paulo',
          uf: 'SP',
        }),
    } as Response)

    const result = await buscarEnderecoPorCep('01310100')

    expect(result?.bairro).toBe('')
  })
})
