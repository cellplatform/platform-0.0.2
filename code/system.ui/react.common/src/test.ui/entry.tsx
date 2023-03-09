import 'symbol-observable';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Pkg } from '../index.pkg.mjs';
import { Dev } from '../ui.dev';

const badge = {
  image: 'https://github.com/cellplatform/platform-0.2.0/actions/workflows/node.esm.yml/badge.svg',
  href: 'https://github.com/cellplatform/platform-0.2.0/actions/workflows/node.esm.yml',
};

(async () => {
  console.info(`Pkg:`, Pkg);
  const { AllSpecs } = await import('./entry.Specs.mjs');

  const el = await Dev.render(Pkg, AllSpecs, { hrDepth: 3, badge });
  const root = createRoot(document.getElementById('root')!);
  root.render(<StrictMode>{el}</StrictMode>);
})();
