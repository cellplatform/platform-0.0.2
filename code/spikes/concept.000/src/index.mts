import { Pkg } from './index.pkg.mjs';
export { Pkg };

/**
 * Dev
 */
export const dev = async () => {
  const { Specs } = await import('./test.ui/entry.Specs.mjs');
  return { Specs, Pkg };
};
