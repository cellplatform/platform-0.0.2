import { slug } from './libs';

/**
 * Unique identifier generators.
 */
export const Id = {
  ctx: {
    prefix: 'dev:ctx.',
    create: () => `${Id.ctx.prefix}${slug()}`,
  },
  renderer: {
    prefix: 'dev:renderer.',
    create: () => `${Id.renderer.prefix}${slug()}`,
  },
};
