import 'symbol-observable';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Pkg } from '../index.pkg.mjs';
import { Dev } from 'sys.ui.react.common';

const { Specs } = await import('./entry.Specs.mjs');

const el = await Dev.render(Pkg, Specs);
const root = createRoot(document.getElementById('root')!);
root.render(<StrictMode>{el}</StrictMode>);
console.info(`Pkg:`, Pkg);
