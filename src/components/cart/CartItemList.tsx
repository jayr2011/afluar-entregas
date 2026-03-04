'use client'

import { CartItem } from '@/types/carrinho'
import { CartItemRow } from './CartItemRow'

interface CartItemsListProps {
  items: CartItem[]
  onRemoveItem?: (id: string) => void
  onDecreaseQty?: (item: CartItem) => void
  onIncreaseQty?: (item: CartItem) => void
}

export function CartItemList({
  items,
  onRemoveItem,
  onDecreaseQty,
  onIncreaseQty,
}: CartItemsListProps) {
  return (
    <ul className="lg:col-span-2 space-y-4" role="list" aria-label="Itens do carrinho">
      {items.map(item => (
        <li key={item.id}>
          <CartItemRow
            item={item}
            onRemove={onRemoveItem}
            onDecreaseQty={onDecreaseQty}
            onIncreaseQty={onIncreaseQty}
          />
        </li>
      ))}
    </ul>
  )
}
