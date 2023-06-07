import { DEFAULTS, TestRunner, type t } from '../common';

export function FieldModuleVerify(data: t.CrdtInfoData, info?: {}) {
  const ctx = {};
  return TestRunner.PropList.runner({
    ctx,

    infoUrl() {
      const url = new URL(location.origin);
      url.searchParams.set(DEFAULTS.query.dev, 'sys.crdt.tests');
      return url.href;
    },

    async list() {
      const { TESTS } = await import('../../../test.ui/-TestRunner.tests.mjs');
      return TESTS.all;
    },
  });
}
