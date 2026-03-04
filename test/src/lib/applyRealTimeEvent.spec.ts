import { describe, it, expect } from 'vitest'
import { applyRealtimeEvent } from '@/lib/applyRealTimeEvent'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type Item = { id: string; nome: string }

function payload(
  eventType: 'INSERT' | 'UPDATE' | 'DELETE',
  oldRow?: Partial<Item>,
  newRow?: Partial<Item>
): RealtimePostgresChangesPayload<Record<string, unknown>> {
  return {
    eventType,
    schema: 'public',
    table: 'test',
    commit_timestamp: '',
    new: newRow ?? null,
    old: oldRow ?? null,
  } as RealtimePostgresChangesPayload<Record<string, unknown>>
}

describe('applyRealtimeEvent', () => {
  const current: Item[] = [
    { id: '1', nome: 'A' },
    { id: '2', nome: 'B' },
    { id: '3', nome: 'C' },
  ]

  it('DELETE com payload.old.id remove o item do array', () => {
    const result = applyRealtimeEvent(current, payload('DELETE', { id: '2' }, undefined))
    expect(result).toEqual([
      { id: '1', nome: 'A' },
      { id: '3', nome: 'C' },
    ])
  })

  it('DELETE sem payload.old retorna current', () => {
    const result = applyRealtimeEvent(current, payload('DELETE', undefined, undefined))
    expect(result).toBe(current)
  })

  it('DELETE com payload.old.id vazio retorna current', () => {
    const result = applyRealtimeEvent(current, payload('DELETE', { id: '' }, undefined))
    expect(result).toBe(current)
  })

  it('INSERT com row novo prepende à lista', () => {
    const row = { id: '4', nome: 'D' }
    const result = applyRealtimeEvent(current, payload('INSERT', undefined, row))
    expect(result[0]).toEqual(row)
  })

  it('INSERT com row já existente atualiza no lugar', () => {
    const row = { id: '2', nome: 'B-atualizado' }
    const result = applyRealtimeEvent(current, payload('INSERT', undefined, row))
    expect(result.find(i => i.id === '2')).toEqual(row)
  })

  it('INSERT sem row.id retorna current', () => {
    const result = applyRealtimeEvent(current, payload('INSERT', undefined, { nome: 'X' }))
    expect(result).toBe(current)
  })

  it('UPDATE com row existente atualiza o item', () => {
    const row = { id: '2', nome: 'B-update' }
    const result = applyRealtimeEvent(current, payload('UPDATE', undefined, row))
    expect(result.find(i => i.id === '2')).toEqual(row)
  })

  it('UPDATE com row inexistente prepende à lista', () => {
    const row = { id: '5', nome: 'E' }
    const result = applyRealtimeEvent(current, payload('UPDATE', undefined, row))
    expect(result[0]).toEqual(row)
  })

  it('UPDATE sem row.id retorna current', () => {
    const result = applyRealtimeEvent(current, payload('UPDATE', undefined, { nome: 'X' }))
    expect(result).toBe(current)
  })
})
