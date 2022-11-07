import { Text } from 'sys.text';
import type * as t from './types.mjs';
export { t, Text };

export const Processor = Text.Markdown.processor();

/**
 * @external
 */
import { clone, equals, groupBy, prop, sortBy, uniq } from 'ramda';
export const R = { clone, equals, groupBy, prop, sortBy, uniq };

/**
 * @system
 */
export { rx, slug, Path, Time, Is } from 'sys.util';
export { FC } from 'sys.util.react';
export { Patch, Json } from 'sys.data.json';

export { Filesystem } from 'sys.fs.indexeddb';
export { TestFilesystem } from 'sys.fs';

/**
 * WARNING - be careful these external references do not blow-up the bundle size.
 */
export { BundlePaths } from '../../Pkg/Paths.mjs';

/**
 * @local
 */
export { Pkg } from '../../index.pkg.mjs';
