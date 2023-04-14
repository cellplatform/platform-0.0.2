import { useEffect, useState } from 'react';
import { MonacoCrdt, MonacoEditor } from 'sys.ui.react.monaco';
import yaml from 'yaml';

import { COLORS, Crdt, css, rx, t, Color } from './common';

import type { DocShared, DocMe } from './-SPEC.Docs.mjs';

type EditorCtx = { monaco: t.Monaco; editor: t.MonacoCodeEditor };
type EditorState = { code: t.AutomergeText; peers: t.EditorPeersState };
type T = t.JsonMap & {
  index: EditorState;
  main: EditorState;
};

export type SpecMonacoSyncProps = {
  docs: {
    me: t.CrdtDocRef<DocMe>;
    shared: t.CrdtDocRef<DocShared>;
  };
  self?: t.Peer;
  visible?: boolean;
  style?: t.CssValue;
  onChange?: (e: { kind: 'index' | 'main'; data: any }) => void;
};

/**
 * A shared syncing code-editor.
 */
export const SpecMonacoSync: React.FC<SpecMonacoSyncProps> = (props) => {
  const { self, docs, visible = true } = props;
  const [indexCtx, setIndexCtx] = useState<EditorCtx>();
  const [mainCtx, setMainCtx] = useState<EditorCtx>();

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const { dispose, dispose$ } = rx.disposable();
    if (self && indexCtx && mainCtx && docs.shared) {
      const local = self.id;

      /**
       * Ensure the code field exists.
       */
      const getTmp = () => docs.shared.current.tmp as T;
      if (!getTmp().index) docs.shared.change((d) => (d.tmp.index = {}));
      if (!getTmp().main) docs.shared.change((d) => (d.tmp.main = {}));

      if (!getTmp().main.peers) docs.shared.change((d) => ((d.tmp as T).main.peers = {}));
      if (!getTmp().index.peers) docs.shared.change((d) => ((d.tmp as T).index.peers = {}));

      if (!getTmp().main.code) docs.shared.change((d) => ((d.tmp as T).main.code = Crdt.text()));
      if (!Crdt.Is.text(docs.me.current.code)) {
        const initial = docs.me.current.text ?? '';
        docs.me.change((d) => (d.code = Crdt.text(initial)));
      }

      const m = docs.me.current.code?.toString();
      console.log('m', m);

      /**
       * Start the syncer.
       */
      const textSyncerIndex = MonacoCrdt.syncer({
        dispose$,
        monaco: indexCtx.monaco,
        editor: indexCtx.editor,
        data: { doc: docs.me, getText: (d) => d.code! },
        // peers: { local, doc: docs.shared, getPeers: (d) => (d.tmp as T).index.peers },
      });

      const textSyncerMain = MonacoCrdt.syncer({
        dispose$,
        monaco: mainCtx.monaco,
        editor: mainCtx.editor,
        data: { doc: docs.shared, getText: (d) => (d.tmp as T).main.code },
        peers: { local, doc: docs.shared, getPeers: (d) => (d.tmp as T).main.peers },
      });

      const listenForChanges = (
        kind: 'index' | 'main',
        doc: t.CrdtDocRef<DocShared>,
        getText: (tmp: T) => t.AutomergeText,
      ) => {
        //
        doc.$.pipe(
          rx.takeUntil(dispose$),
          rx.debounceTime(500),
          rx.distinctUntilChanged(
            (prev, next) => getText(prev.doc.tmp as T) === getText(next.doc.tmp as T),
          ),
        ).subscribe((e) => {
          /**
           * TODO 🐷 - parse the YAML and update the "data" object.
           */
          // const text = getText(e.doc.tmp as T);
          // const data = yaml.parse(text.toString());
          // props.onChange?.({ kind, data });
        });
      };

      listenForChanges('index', docs.shared, (tmp: T) => tmp.index.code);
      listenForChanges('main', docs.shared, (tmp: T) => tmp.main.code);
    }

    return () => {
      dispose();
      console.log('dispose monaco footer');
    };
  }, [self, docs.shared, docs.me, mainCtx, indexCtx]);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      backgroundColor: COLORS.WHITE,
      height: visible ? 250 : 0,
      display: visible ? 'grid' : 'none',
      gridTemplateColumns: 'minmax(200px, 400px) 2fr',
    }),
    editor: css({
      Absolute: 0,
    }),
    left: css({
      position: 'relative',
      borderRight: `solid 1px ${Color.alpha(COLORS.DARK, 0.1)}`,
    }),
    right: css({
      position: 'relative',
    }),
  };

  if (!self || !docs.shared) return <div {...css(styles.base, props.style)} />;

  const SAMPLE_INDEX = `
env:
  - chat:data:video

docs:
  - meetings/latest
  - project/slc/
  `.substring(1);

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.left}>
        <MonacoEditor
          style={styles.editor}
          language={'yaml'}
          text={docs.me.current.code?.toString()}
          onReady={({ editor, monaco }) => setIndexCtx({ editor, monaco })}
        />
      </div>
      <div {...styles.right}>
        <MonacoEditor
          style={styles.editor}
          language={'yaml'}
          focusOnLoad={true}
          onReady={({ editor, monaco }) => setMainCtx({ editor, monaco })}
        />
      </div>
    </div>
  );
};
