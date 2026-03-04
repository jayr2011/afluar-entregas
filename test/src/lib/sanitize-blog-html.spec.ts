import { describe, it, expect } from 'vitest'
import { sanitizeBlogHtml } from '@/lib/sanitize-blog-html'

describe('sanitizeBlogHtml', () => {
  it('remove tags script', () => {
    expect(sanitizeBlogHtml('<script>alert(1)</script>')).not.toContain('script')
  })

  it('mantém tags permitidas p, strong, em', () => {
    expect(sanitizeBlogHtml('<p><strong>x</strong></p>')).toContain('<p>')
  })

  it('permite href em tag a', () => {
    expect(sanitizeBlogHtml('<a href="https://x.com">link</a>')).toContain('href')
  })

  it('permite src em tag img', () => {
    expect(sanitizeBlogHtml('<img src="https://x.com/a.png">')).toContain('src')
  })

  it('retorna string vazia para input vazio', () => {
    expect(sanitizeBlogHtml('')).toBe('')
  })

  it('remove atributos não permitidos', () => {
    expect(sanitizeBlogHtml('<a onclick="evil()">x</a>')).not.toContain('onclick')
  })
})
