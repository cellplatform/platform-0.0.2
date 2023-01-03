import { mergeDeepRight, clone, curry, partial } from 'ramda';
export const R = { mergeDeepRight, clone, curry, partial };

/**
 * @system
 */
export { rx, Time, slug, Path, asArray, maybeWait } from 'sys.util';
export { FC, useMouseState } from 'sys.util.react';
export { css, Color } from 'sys.util.css';
export { Test, TestTree } from 'sys.test.spec';
