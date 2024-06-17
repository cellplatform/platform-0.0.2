import { Lens } from '../Doc.Lens';
import { Namespace } from '../Doc.Namespace';
import { DocMeta as Meta } from './Doc.Meta';
import { DocPatch as Patch } from './Doc.Patch';
import { toBinary } from './Doc.u.binary';
import { del } from './Doc.u.delete';
import { ephemeral } from './Doc.u.ephemeral';
import { get } from './Doc.u.get';
import { getOrCreate } from './Doc.u.getOrCreate';
import { heads, history } from './Doc.u.history';
import { merge } from './Doc.u.merge';
import { splice } from './Doc.u.splice';
import { Tag } from './Doc.u.tag';
import { Data, Is, DocUri as Uri, toObject, type t } from './common';
import { toHandle } from './u';

type Uri = t.DocUri | t.UriString;

export const Doc = {
  Is,
  Uri,
  Meta,
  Data,
  Patch,
  Tag,

  Lens,
  Namespace,
  lens: Lens.create,
  ns: Namespace.create,

  get,
  getOrCreate,
  delete: del,

  toObject,
  splice,
  merge,

  ephemeral,
  history,
  heads,
  toHandle,
  toBinary,
} as const;
