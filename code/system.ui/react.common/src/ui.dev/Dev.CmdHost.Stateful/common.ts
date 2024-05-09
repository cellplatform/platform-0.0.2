import { DEFAULTS as BASE, type t } from '../common';
import { Filter } from '../Dev.CmdHost/common.Filter';

export * from '../common';
export { Filter };

/**
 * Constants
 */
const filter: t.CmdHostFilter = (imports, command) => {
  return Filter.imports(imports, command, { maxErrors: 1 });
};

export const DEFAULTS = {
  displayName: 'CmdHost.Stateful',
  filter,
  qs: BASE.qs,
} as const;
