import { Config } from '../../../config.mjs';
export default Config.vite(import.meta.url, (e) => {
  e.lib();
  e.addExternalDependency(e.ctx.deps.map((d) => d.name));
});
