import type { t } from './common';
import { Pkg } from '../index.pkg';
export { Pkg };
const ns = Pkg.name;

export const Specs = {
  [`${ns}.tests`]: () => import('./-TestRunner'),
  [`${ns}.ui.Sample.01`]: () => import('../ui/ui.Sample.01/-SPEC'),
} as t.SpecImports;

export default Specs;
