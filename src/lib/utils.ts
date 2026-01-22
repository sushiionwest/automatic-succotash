import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Reorder items in a list after drag and drop
 * Returns new array with updated order values
 */
export function reorderItems<T extends { id: string; order: number }>(
  items: T[],
  itemId: string,
  newIndex: number
): T[] {
  const item = items.find((i) => i.id === itemId);
  if (!item) return items;

  const filtered = items.filter((i) => i.id !== itemId);
  filtered.splice(newIndex, 0, item);

  return filtered.map((i, idx) => ({ ...i, order: idx }));
}

/**
 * Move item between lists (columns)
 * Returns updated source and destination lists
 */
export function moveItemBetweenLists<T extends { id: string; order: number }>(
  sourceItems: T[],
  destItems: T[],
  itemId: string,
  destIndex: number
): { source: T[]; dest: T[] } {
  const item = sourceItems.find((i) => i.id === itemId);
  if (!item) return { source: sourceItems, dest: destItems };

  const newSource = sourceItems
    .filter((i) => i.id !== itemId)
    .map((i, idx) => ({ ...i, order: idx }));

  const newDest = [...destItems];
  newDest.splice(destIndex, 0, item);
  const orderedDest = newDest.map((i, idx) => ({ ...i, order: idx }));

  return { source: newSource, dest: orderedDest };
}
