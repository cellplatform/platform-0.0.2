import { type t } from '../common';

export * from '../common';
export { Icons } from '../Icons.mjs';

/**
 * Constants
 */
const sample: t.ConceptSlug = {
  id: 'uniq.id',
  title: 'Name and Topic of the Slug.',
  video: {
    id: 499921561, //→ vimeo/tubes
    position: ['left', 'bottom'],
    scale: 1.1,
  },
};

export const DEFAULTS = {
  sample,
} as const;
