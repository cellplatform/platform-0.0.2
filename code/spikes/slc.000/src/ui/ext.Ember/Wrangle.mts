import { type t } from './common';

/**
 * Helpers
 */
export const Wrangle = {
  nextSlug(slugs: t.ConceptSlug[] = [], selected?: number) {
    const index = Math.max(0, selected ?? 0) + 1;
    const exists = index < slugs.length;
    return {
      exists,
      index: exists ? index : undefined,
      slug: slugs[index],
    } as const;
  },
} as const;
