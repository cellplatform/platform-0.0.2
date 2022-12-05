import { Spec } from '../../ui.test';
import { BrandLayout } from '.';

export default Spec.describe('BrandLayout', (e) => {
  e.it('init', async (e) => {
    const ctx = Spec.ctx(e);
    const el = <BrandLayout />;
    ctx.size('fill').render(el);
  });
});
