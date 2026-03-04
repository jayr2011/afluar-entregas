import sanitizeHtml from 'sanitize-html'

const ALLOWED_TAGS = [
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'pre',
  'code',
  'ul',
  'ol',
  'li',
  'strong',
  'em',
  'br',
  'a',
  'img',
]

const ALLOWED_ATTR: Record<string, string[]> = {
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt'],
}

export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTR,
    allowedSchemes: ['https', 'http'],
    allowedSchemesByTag: { img: ['https', 'http'] },
  })
}
