import * as t from '../common/types.mjs';

type DirPath = string;
type Size = { bytes: number; size: string };

export type BundlePaths = {
  latest: DirPath;
  app: {
    base: DirPath;
    lib: DirPath;
    data: DirPath;
  };
  data: {
    base: DirPath;
    md: DirPath;
    logfile: DirPath;
  };
};

export type BundleSize = { total: Size; lib: Size; data: { md: Size } };
export type BundleLogEntry = {
  kind: 'pkg:content-bundle';
  version: string;
  paths: BundlePaths;
  size: BundleSize;
};
