import * as t from '../common/types.mjs';

export const BundlePaths: t.BundlePaths = {
  latest: '.latest/',
  app: {
    base: 'app/',
    lib: 'app/lib/',
    data: 'app/data/',
  },
  data: {
    parent: 'app/',
    base: 'data/',
    md: 'md/',
    logfile: 'log.json',
  },
};
