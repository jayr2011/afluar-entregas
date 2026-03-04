import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import logger from '@/lib/logger'

describe('logger', () => {
  let infoSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    infoSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('exporta debug como função', () => {
    expect(typeof logger.debug).toBe('function')
  })

  it('exporta info como função', () => {
    expect(typeof logger.info).toBe('function')
  })

  it('logger.info chama console.info', () => {
    logger.info('x')
    expect(console.info).toHaveBeenCalled()
  })

  it('logger.error chama console.error', () => {
    logger.error('x')
    expect(console.error).toHaveBeenCalled()
  })
})
