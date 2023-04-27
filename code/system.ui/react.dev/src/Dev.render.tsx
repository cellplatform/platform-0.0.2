import { COLORS, DevWrangle, t } from './common';
import { Harness } from './ui/Harness';
import { DevKeyboard } from './ui/Keyboard';
import { SpecList } from './ui/SpecList';

type Options = {
  location?: t.UrlInput;
  badge?: t.SpecListBadge;
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
    <SpecList
      title={pkg.name}
      version={pkg.version}
      imports={specs}
      badge={options.badge}
      hrDepth={options.hrDepth}
      style={style}
    />
  );
}
