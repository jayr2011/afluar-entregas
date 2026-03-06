'use client'

import { useEffect, useState } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Produto } from '@/types/produtos'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { applyRealtimeEvent } from '@/lib/applyRealTimeEvent'
import { revalidateProdutosCache } from '@/app/cardapio/actions'
import logger from '@/lib/logger'
import { useProductsStore } from '@/store/productsStore'

export function useRealtimeProdutos(initialProdutos: Produto[]): Produto[] {
  const [produtosRealtime, setProdutosRealtime] = useState<Produto[]>(initialProdutos)

  useEffect(() => {
    setProdutosRealtime(initialProdutos)
    useProductsStore.getState().setProducts(initialProdutos)
  }, [initialProdutos])

  useEffect(() => {
    const channel = supabaseBrowser
      .channel('produtos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'produtos' },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          logger.debug('[realtime:produtos] evento recebido', {
            eventType: payload.eventType,
            table: payload.table,
          })

          setProdutosRealtime(current => {
            const next = applyRealtimeEvent<Produto>(current, payload)
            useProductsStore.getState().setProducts(next)
            return next
          })

          revalidateProdutosCache().catch(err => {
            logger.error('[realtime:produtos] erro ao revalidar cache', {
              error: err instanceof Error ? err.message : err,
            })
          })
        }
      )
      .subscribe()

    return () => {
      void supabaseBrowser.removeChannel(channel)
    }
  }, [])

  return produtosRealtime
}
