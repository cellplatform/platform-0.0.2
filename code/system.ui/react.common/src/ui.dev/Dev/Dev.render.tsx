import { COLORS, t, DevBase, DevWrangle, DevKeyboard } from '../common';
import { CmdHostStateful } from '../CmdHost';
import { KeyboardActions } from './Keyboard.mjs';

type EscapeAction = 'ReloadRootUrl';

type Options = {
  location?: t.UrlInput;
  badge?: t.SpecListBadge;
  hrDepth?: number;
  keyboard?: boolean;
  doubleEscapeKeyAction?: null | EscapeAction;
  defaultNamespace?: string;
  forceDev?: boolean;
  style?: t.CssValue;
};

/**
 * Render a harness with the selected `dev=<namespace>` import
 * or an index list of available specs.
 */
export async function render(
  pkg: { name: string; version: string },
  specs: t.SpecImports,
  options: Options = {},
) {
  const { keyboard = true, doubleEscapeKeyAction = 'ReloadRootUrl' } = options;
  const url = DevWrangle.Url.navigate.formatDevFlag(options);
  const spec = await DevWrangle.Url.module(url, specs);

  const style = options.style ?? {
    Absolute: 0,
    backgroundColor: COLORS.WHITE,
  };

  if (keyboard) {
    DevKeyboard.listen({
      onDoubleEscape(e) {
        if (spec) KeyboardActions.onDoubleEscape(doubleEscapeKeyAction);
      },
    });
  }

  if (spec) {
    return <DevBase.Harness spec={spec} style={style} />;
  }

  return (
    <CmdHostStateful
      pkg={pkg}
      specs={specs}
      badge={options.badge}
      hrDepth={options.hrDepth}
      style={style}
    />
  );
}
