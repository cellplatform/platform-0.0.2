import { Config } from '../../../config.mjs';

export default Config.vite(import.meta.url, (e) => {
  e.lib();
  e.target('web');
  e.plugin('web:react');
  e.externalDependency(e.ctx.deps.filter((d) => d.name !== 'react').map((d) => d.name));
});

export const tsconfig = Config.ts((e) => e.env('web', 'web:react'));
