import { useEffect, useRef } from 'react';
import { Color, css, useRubberband, type t } from './common';
import { Footer } from './ui.Footer';
import { List } from './ui.List';
import { Title } from './ui.Title';
import { useScrollController } from './useScrollController.mjs';
import { useScrollObserver } from './useScrollObserver.mjs';

type LiMap = Map<number, HTMLLIElement>;

export const View: React.FC<t.ModuleListProps> = (props) => {
  const { theme, scroll = false, focused = true, enabled = true } = props;
  const url = new URL(props.href ?? window.location.href);
  const imports = (props.imports ?? {}) as t.ModuleImports;

  const baseRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<LiMap>(new Map<number, HTMLLIElement>());

  useRubberband(props.allowRubberband ?? false);
  useScrollObserver(baseRef, itemRefs.current, props.onItemVisibility);
  useScrollController(baseRef, itemRefs.current, props.scrollTo$);

  /**
   * Lifecycle
   */
  useEffect(() => {
    if (!enabled) return;
    const i = props.selectedIndex;
    const isUnselected = i === undefined || (typeof i === 'number' && i < 0);
    if (isUnselected) props.onItemSelect?.({ index: -1 });
  }, [props.selectedIndex, enabled]);

  /**
   * Handlers
   */
  const handleItemReadyChange: t.ModuleListItemReadyHandler = (e) => {
    const map = itemRefs.current;
    if (e.lifecycle === 'ready') map.set(e.index, e.el!);
    if (e.lifecycle === 'disposed') map.delete(e.index);
  };

  /**
   * Render
   */
  const color = Color.fromTheme(theme);
  const styles = {
    base: css({
      position: 'relative',
      Scroll: scroll,
      Absolute: scroll ? 0 : undefined,
      pointerEvents: enabled ? 'auto' : 'none',
    }),
    body: css({
      position: 'relative',
      cursor: 'default',
      fontFamily: 'sans-serif',
      lineHeight: '2em',
      color,
      boxSizing: 'border-box',
      padding: 30,
      paddingTop: 20,
    }),
    title: css({ marginBottom: 20 }),
    list: {
      outer: css({ marginTop: 30, display: 'grid' }),
      inner: css({ minWidth: 550, MarginX: 50 }),
    },
  };

  const elList = (
    <div {...styles.list.outer}>
      <div {...styles.list.inner}>
        <List
          url={url}
          imports={imports}
          theme={theme}
          enabled={enabled}
          selectedIndex={props.selectedIndex}
          focused={focused}
          hrDepth={props.hrDepth}
          showParamDev={props.showParamDev}
          onItemReadyChange={handleItemReadyChange}
          onItemClick={props.onItemClick}
          onItemSelect={props.onItemSelect}
        />
      </div>
    </div>
  );

  const elBody = (
    <div {...styles.body}>
      <Title
        enabled={enabled}
        title={props.title}
        version={props.version}
        badge={props.badge}
        theme={theme}
        style={styles.title}
      />
      {elList}
      <Footer theme={theme} enabled={enabled} />
    </div>
  );

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      {elBody}
    </div>
  );
};
