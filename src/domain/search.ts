import Fuse, { type IFuseOptions } from 'fuse.js';
import type { Item } from '../db/schema';

const FUSE_OPTIONS: IFuseOptions<Item> = {
  keys: [
    { name: 'names.hi', weight: 0.35 },
    { name: 'names.en', weight: 0.3 },
    { name: 'names.hinglish', weight: 0.25 },
    { name: 'aliases', weight: 0.2 },
  ],
  threshold: 0.38,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

export class ItemSearchIndex {
  private fuse: Fuse<Item>;

  constructor(items: Item[]) {
    this.fuse = new Fuse(items, FUSE_OPTIONS);
  }

  updateItems(items: Item[]): void {
    this.fuse.setCollection(items);
  }

  search(query: string): Item[] {
    const trimmed = query.trim();
    if (!trimmed) {
      return [];
    }
    const results = this.fuse.search(trimmed);
    return results.map((r) => r.item);
  }
}

/**
 * Filter items by category and/or trilingual search query.
 */
export function filterAndSearchItems(
  items: Item[],
  category: string = 'all',
  query: string = '',
  searchIndex?: ItemSearchIndex
): Item[] {
  let list = items;

  if (category && category !== 'all') {
    list = list.filter((item) => item.category === category);
  }

  const trimmed = query.trim();
  if (!trimmed) {
    return list;
  }

  const index = searchIndex || new ItemSearchIndex(list);
  const matched = index.search(trimmed);

  if (category && category !== 'all') {
    return matched.filter((item) => item.category === category);
  }

  return matched;
}
