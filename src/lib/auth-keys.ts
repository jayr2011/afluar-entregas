import { type NextRequest } from 'next/server'

export function requireAdminApiKey(request: NextRequest): boolean {
  const key = request.headers.get('x-api-key')
  const expected = process.env.ADMIN_API_KEY
  if (!expected || !key) return false
  if (key.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < key.length; i++) {
    diff |= key.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return diff === 0
}
