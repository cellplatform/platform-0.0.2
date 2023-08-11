export { Pkg } from '../index.pkg.mjs';

export const Specs = {
  'ext.prosemirror.tests': () => import('./-TestRunner'),
  'ext.prosemirror.ui.Info': () => import('../ui/ui.Info/-SPEC'),
  'ext.prosemirror.ui.Example': () => import('../ui/ui.Example/-SPEC'),
};

export default Specs;
