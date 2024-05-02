import { VscSymbolClass } from 'react-icons/vsc';
import { Color, css, DEFAULTS, type t } from './common';
import { ListItem } from './ui.List.Item';

export type ListProps = {
  enabled?: boolean;
  imports: t.ModuleImports;
  url: URL;
  focused: boolean;
  scroll?: boolean;
  selectedIndex?: number;
  showParamDev?: boolean;
  hrDepth?: number;
  theme?: t.CommonTheme;
  style?: t.CssValue;
  onItemReadyChange?: t.ModuleListItemReadyHandler;
  onItemClick?: t.ModuleListItemHandler;
  onItemSelect?: t.ModuleListItemHandler;
};

export const List: React.FC<ListProps> = (props) => {
  const { imports, url, showParamDev = true, enabled = true, focused, theme } = props;
  const importsKeys = Object.keys(props.imports);
  const hasDevParam = url.searchParams.has(DEFAULTS.qs.dev);

  /**
   * Render
   */
  const color = Color.fromTheme(theme);
  const styles = {
    base: css({
      listStyleType: 'none',
      color,
      borderLeft: `solid 1px ${Color.alpha(color, 0.03)}`,
      padding: 0,
      margin: 0,
    }),
    hrDashed: css({
      border: 'none',
      borderTop: `dashed 1px ${Color.alpha(color, 0.4)}`,
      marginTop: 30,
      marginBottom: 10,
    }),
    empty: css({
      fontSize: 14,
      fontStyle: 'italic',
      opacity: 0.4,
      display: 'grid',
      placeItems: 'center',
    }),
  };

  const item = (
    index: number,
    address: string | undefined,
    options: { title?: string; ns?: boolean; Icon?: t.IconType } = {},
  ) => {
    const selected = !options.ns ? false : index === props.selectedIndex;
    return (
      <ListItem
        key={index}
        index={index}
        enabled={enabled}
        selected={selected}
        focused={focused}
        url={url}
        imports={imports}
        address={address}
        title={options.title}
        ns={options.ns}
        Icon={options.Icon}
        hrDepth={props.hrDepth}
        theme={theme}
        onReadyChange={props.onItemReadyChange}
        onClick={props.onItemClick}
        onSelect={props.onItemSelect}
      />
    );
  };

  const elEmpty = importsKeys.length === 0 && <div {...styles.empty}>{'Nothing to display.'}</div>;
  const elList = importsKeys.map((key, i) => item(i, key, { Icon: VscSymbolClass, ns: true }));

  return (
    <ul {...css(styles.base, props.style)}>
      {elEmpty}
      {elList}

      {showParamDev && <hr {...styles.hrDashed} />}
      {showParamDev && hasDevParam && item(-1, undefined, { title: '?dev - remove param' })}
      {showParamDev && !hasDevParam && item(-1, 'true', { title: '?dev - add param' })}
    </ul>
  );
};
