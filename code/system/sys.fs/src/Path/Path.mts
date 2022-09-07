import { parts } from './Path.parts.mjs';
import { PathUri as Uri } from './PathUri.mjs';
import * as Join from './Path.join.mjs';
import * as Trim from './Path.trim.mjs';
import * as To from './Path.to.mjs';

export const Path = {
  Uri,
  parts,
  ...Join,
  ...Trim,
  ...To,
};
