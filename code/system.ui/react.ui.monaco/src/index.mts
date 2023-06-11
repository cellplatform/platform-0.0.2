/**
 * Module (Meta)
 */
import { Pkg } from './index.pkg.mjs';
export { Pkg };

/**
 * Code Editor
 */
export { MonacoEditor } from './ui/MonacoEditor';
export { MonacoCrdt } from './ui.logic/MonacoCrdt';

/**
 * Dev
 */
export const dev = async () => {
  const { Specs } = await import('./test.ui/entry.Specs.mjs');
  return { Specs, Pkg };
};
