import { useState, useEffect, useRef } from 'react';
import { CmdHost, CmdHostProps } from './ui.CmdHost';
import { R, DEFAULTS, t, SpecList, rx } from './common';

export type CmdHostStatefulProps = Omit<CmdHostProps, 'filter'> & {
  mutateUrl?: boolean;
};

type T = t.Subject<t.SpecListScrollTarget>;

/**
 * A version of <CmdHost> that manages state interanally.
 */
export const CmdHostStateful: React.FC<CmdHostStatefulProps> = (props) => {
  const { mutateUrl = true } = props;

  const [command, setCommand] = useState(Wrangle.url().filter);
  const [isFocused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const specs = SpecList.Filter.specs(props.specs, command);
  const total = Object.keys(specs).length;
  const hintKeys = Wrangle.hintKey({ isFocused, selectedIndex, specs, command });

  const [childItems, setChildItems] = useState<t.SpecListChildVisibility[]>([]);
  const selectionChangeTrigger = childItems.map((item) => item.isOnScreen).join(',');
  const scrollToRef$ = useRef<T>(new rx.Subject<t.SpecListScrollTarget>());

  /**
   * [Effects]
   */
  useEffect(() => {
    const child = childItems[selectedIndex];
    const scrollTo$ = scrollToRef$.current;
    if (child && !child.isOnScreen) scrollTo$.next({ index: child.index });
  }, [selectedIndex, selectionChangeTrigger]);

  useEffect(() => {
    setSelectedIndex(0); // Reset the selection when the filter changes.
  }, [total, command]);

  /**
   * [Handlers]
   */
  const handleFilterChanged: t.CmdHostChangedHandler = (e) => {
    if (mutateUrl) Url.mutateFilter(e.command);
    setCommand(e.command);
    props.onChanged?.(e);
  };

  const handleKeyboard = (e: t.TextInputKeyEvent) => {
    const done = () => e.preventDefault();

    if (e.key === 'Home' || (e.key === 'ArrowUp' && e.metaKey)) {
      setSelectedIndex(Wrangle.selected(specs, 0));
      return done();
    }
    if (e.key === 'End' || (e.key === 'ArrowDown' && e.metaKey)) {
      setSelectedIndex(Wrangle.selected(specs, total - 1));
      return done();
    }

    if (e.key === 'ArrowUp') {
      const next = selectedIndex - (e.altKey ? 5 : 1);
      setSelectedIndex(Wrangle.selected(specs, next));
      return done();
    }
    if (e.key === 'ArrowDown') {
      const next = selectedIndex + (e.altKey ? 5 : 1);
      setSelectedIndex(Wrangle.selected(specs, next));
      return done();
    }
    if (e.key === 'Enter' && mutateUrl) {
      Url.mutateSelected(selectedIndex, specs);

      /**
       * NB: forced page reload here
       * 🐷 Integration Extension (HERE)
       *    - load inline as child <Component>.
       *    - load transitions (spinner, fade-in, etc).
       */
      const nextUrl = window.location.href;
      window.location.href = nextUrl;

      return done();
    }
  };

  /**
   * [Render]
   */
  return (
    <CmdHost
      {...props}
      command={command}
      selectedIndex={isFocused ? selectedIndex : undefined}
      hintKey={hintKeys}
      scrollTo$={scrollToRef$.current}
      onChanged={handleFilterChanged}
      onCmdFocusChange={(e) => setFocused(e.isFocused)}
      onKeyDown={handleKeyboard}
      onChildVisibility={(e) => setChildItems(e.items)}
    />
  );
};

/**
 * [Helpers]
 */
const Wrangle = {
  url() {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const filter = params.get(DEFAULTS.QS.filter) ?? '';
    return { url, params, filter };
  },

  selected(specs: t.SpecImports | undefined, next: number) {
    if (!specs) return -1;
    const total = Object.keys(specs).length - 1;
    return total >= 0 ? R.clamp(0, total, next) : -1;
  },

  hintKey(args: {
    isFocused: boolean;
    specs?: t.SpecImports;
    selectedIndex: number;
    command: string;
  }) {
    if (!args.isFocused) return ['↑', '↓', '⌘K'];
    return ['↑', '↓', 'enter'];
  },
};

const Url = {
  mutateFilter(filter: string) {
    const { url, params } = Wrangle.url();
    if (filter) params.set(DEFAULTS.QS.filter, filter);
    if (!filter) params.delete(DEFAULTS.QS.filter);
    const path = url.href;
    window.history.pushState({ path }, '', path);
  },

  mutateSelected(selectedIndex: number, specs?: t.SpecImports) {
    if (!specs) return;
    if (selectedIndex < 0) return;

    const { url, params } = Wrangle.url();
    const ns = Object.keys(specs)[selectedIndex];
    if (!ns) return;

    params.set(DEFAULTS.QS.dev, ns);
    const path = url.href;
    window.history.pushState({ path }, '', path);
  },
};
