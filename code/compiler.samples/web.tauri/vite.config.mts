import { Config } from '../../../config.mjs';

export const tsconfig = Config.ts((e) => e.env('web:react'));
export default Config.vite(import.meta.url, (e) => e.env('web:react'));
