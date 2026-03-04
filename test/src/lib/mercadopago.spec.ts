import { describe, it, expect, vi, afterEach } from 'vitest'

const mockPreference = vi.hoisted(() =>
  vi.fn().mockImplementation(function (this: object) {
    return this ?? {}
  })
)
const mockPayment = vi.hoisted(() =>
  vi.fn().mockImplementation(function (this: object) {
    return this ?? {}
  })
)
const mockMercadoPagoConfig = vi.hoisted(() =>
  vi.fn().mockImplementation(function (this: object) {
    return this ?? {}
  })
)

vi.mock('mercadopago', () => ({
  MercadoPagoConfig: mockMercadoPagoConfig,
  Preference: mockPreference,
  Payment: mockPayment,
}))

vi.mock('@/lib/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

async function loadMercadopagoModule(envOverrides: Record<string, string | undefined>) {
  vi.resetModules()
  vi.unstubAllEnvs?.()
  for (const [key, value] of Object.entries(envOverrides)) {
    if (value !== undefined) {
      vi.stubEnv(key, value)
    } else {
      delete process.env[key]
    }
  }
  const mod = await import('@/lib/mercadopago')
  return mod
}

describe('mercadopago', () => {
  afterEach(() => {
    vi.unstubAllEnvs?.()
  })

  describe('quando não há token', () => {
    const noToken = {
      MERCADOPAGO_ACCESS_TOKEN: undefined as string | undefined,
      MP_ACCESS_TOKEN: undefined as string | undefined,
    }

    it('exporta preferenceClient como null', async () => {
      const mod = await loadMercadopagoModule(noToken)
      expect(mod.preferenceClient).toBe(null)
    })

    it('exporta paymentClient como null', async () => {
      const mod = await loadMercadopagoModule(noToken)
      expect(mod.paymentClient).toBe(null)
    })
  })

  describe('quando há MERCADOPAGO_ACCESS_TOKEN', () => {
    it('instancia MercadoPagoConfig com accessToken', async () => {
      await loadMercadopagoModule({ MERCADOPAGO_ACCESS_TOKEN: 'test-token' })
      expect(mockMercadoPagoConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: 'test-token',
          options: { timeout: 5000 },
        })
      )
    })

    it('exporta preferenceClient não nulo', async () => {
      const mod = await loadMercadopagoModule({ MERCADOPAGO_ACCESS_TOKEN: 'test-token' })
      expect(mod.preferenceClient).not.toBe(null)
    })

    it('exporta paymentClient não nulo', async () => {
      const mod = await loadMercadopagoModule({ MERCADOPAGO_ACCESS_TOKEN: 'test-token' })
      expect(mod.paymentClient).not.toBe(null)
    })

    it('chama Preference com o client configurado', async () => {
      mockPreference.mockClear()
      await loadMercadopagoModule({ MERCADOPAGO_ACCESS_TOKEN: 'test-token' })
      expect(mockPreference).toHaveBeenCalledWith(expect.anything())
    })

    it('chama Payment com o client configurado', async () => {
      mockPayment.mockClear()
      await loadMercadopagoModule({ MERCADOPAGO_ACCESS_TOKEN: 'test-token' })
      expect(mockPayment).toHaveBeenCalledWith(expect.anything())
    })
  })

  describe('quando há apenas MP_ACCESS_TOKEN', () => {
    it('instancia MercadoPagoConfig com MP_ACCESS_TOKEN', async () => {
      await loadMercadopagoModule({
        MERCADOPAGO_ACCESS_TOKEN: undefined,
        MP_ACCESS_TOKEN: 'mp-token',
      })
      expect(mockMercadoPagoConfig).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken: 'mp-token' })
      )
    })

    it('exporta preferenceClient não nulo', async () => {
      const mod = await loadMercadopagoModule({
        MERCADOPAGO_ACCESS_TOKEN: undefined,
        MP_ACCESS_TOKEN: 'mp-token',
      })
      expect(mod.preferenceClient).not.toBe(null)
    })

    it('exporta paymentClient não nulo', async () => {
      const mod = await loadMercadopagoModule({
        MERCADOPAGO_ACCESS_TOKEN: undefined,
        MP_ACCESS_TOKEN: 'mp-token',
      })
      expect(mod.paymentClient).not.toBe(null)
    })
  })

  describe('quando MercadoPagoConfig lança erro', () => {
    it('exporta preferenceClient como null após erro', async () => {
      mockMercadoPagoConfig.mockImplementationOnce(function () {
        throw new Error('init failed')
      })
      const mod = await loadMercadopagoModule({ MERCADOPAGO_ACCESS_TOKEN: 'test-token' })
      expect(mod.preferenceClient).toBe(null)
    })

    it('exporta paymentClient como null após erro', async () => {
      mockMercadoPagoConfig.mockImplementationOnce(function () {
        throw new Error('init failed')
      })
      const mod = await loadMercadopagoModule({ MERCADOPAGO_ACCESS_TOKEN: 'test-token' })
      expect(mod.paymentClient).toBe(null)
    })
  })
})
