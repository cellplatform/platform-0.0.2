import { Config } from '../../../config.mjs';

export const tsconfig = Config.ts((e) => {
  e.env('web');
});

export default Config.vite(import.meta.url, (e) => {
  e.target('web');
});
