import { COLORS, DevWrangle, type t } from './common';
import { DevKeyboard } from './fn.Keyboard';
import { Harness } from './ui/Harness';
import { ModuleList } from './ui/List.Module';

type Options = {
  location?: t.UrlInput;
  badge?: t.ImageBadge;
  hrDepth?: number;
  keyboard?: boolean;
  style?: t.CssValue;
};

/**
 * Render a harness with the selected `dev=<namespace>` import
 * or an index list of available specs.
 *
 * NOTE: This is overridden with a more complex implementation
 *      in the [sys.ui.react.common] package.
 */
export async function render(
  pkg: { name: string; version: string },
  specs: t.SpecImports,
  options: Options = {},
) {
  const { keyboard = true } = options;
  const url = DevWrangle.Url.navigate.formatDevFlag(options);
  const spec = await DevWrangle.Url.module(url, specs);
  const style = options.style ?? { Absolute: 0, backgroundColor: COLORS.WHITE };

  if (keyboard) DevKeyboard.listen({});

  if (spec) {
    return <Harness spec={spec} style={style} />;
  }

  return (
    <ModuleList
      title={pkg.name}
      version={pkg.version}
      imports={specs}
      badge={options.badge}
      hrDepth={options.hrDepth}
      style={style}
    />
  );
}
