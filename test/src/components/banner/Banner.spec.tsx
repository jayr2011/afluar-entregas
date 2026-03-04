import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Banner } from '@/components/banner/Banner'

vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- mock para testes
    <img src={props.src} alt={props.alt} data-testid="banner-image" />
  ),
}))

const createMatchMedia = (overrides: { mobile?: boolean; reduceMotion?: boolean } = {}) => {
  const { mobile = false, reduceMotion = true } = overrides
  return vi.fn().mockImplementation((query: string) => {
    const isMobileQuery = query.includes('767')
    const isReduceMotionQuery = query.includes('reduced-motion')
    let matches = false
    if (isMobileQuery) matches = mobile
    if (isReduceMotionQuery) matches = reduceMotion
    return {
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
  })
}

describe('Banner', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: createMatchMedia({ mobile: false, reduceMotion: true }),
    })
  })

  it('retorna null quando slides vazio', () => {
    const { container } = render(<Banner slides={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renderiza carousel com aria-label', () => {
    render(<Banner slides={[{ src: '/banner.jpg', alt: 'Banner 1' }]} />)
    const region = screen.getByRole('region', {
      name: /carrossel de banners promocionais/i,
    })
    expect(region).toBeTruthy()
  })

  it('renderiza status acessível com slide atual', () => {
    render(<Banner slides={[{ src: '/banner.jpg', alt: 'Banner 1' }]} />)
    const status = screen.getByRole('status')
    expect(status.textContent).toMatch(/Slide 1 de 1/)
  })

  it('chama onClick do slide quando botão é clicado', async () => {
    const onClick = vi.fn()
    render(<Banner slides={[{ src: '/banner.jpg', alt: 'Clique aqui', onClick }]} />)
    const button = screen.getByRole('button', { name: 'Clique aqui' })
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('usa mobileSrc quando isMobile e slide tem mobileSrc', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: createMatchMedia({ mobile: true, reduceMotion: true }),
    })
    render(
      <Banner
        slides={[
          {
            src: '/desktop.jpg',
            mobileSrc: '/mobile.jpg',
            alt: 'Banner',
          },
        ]}
      />
    )
    await waitFor(() => {
      const img = screen.getByTestId('banner-image')
      expect(img.getAttribute('src')).toContain('mobile')
    })
  })

  it('usa src quando não é mobile', async () => {
    render(
      <Banner
        slides={[
          {
            src: '/desktop.jpg',
            mobileSrc: '/mobile.jpg',
            alt: 'Banner',
          },
        ]}
      />
    )
    await waitFor(() => {
      const img = screen.getByTestId('banner-image')
      expect(img.getAttribute('src')).toContain('desktop')
    })
  })
})
