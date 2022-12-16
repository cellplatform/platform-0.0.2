import { Spec } from '../../test.ui';
import { Root } from '.';

export default Spec.describe('Root', (e) => {
  e.it('init', async (e) => {
    const ctx = Spec.ctx(e);
    ctx.component.size('fill').render(() => <Root />);
  });
});
