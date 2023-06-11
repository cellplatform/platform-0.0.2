import { useEffect, useRef } from 'react';
import { HarnessHost } from '../Harness.Host';
import { DebugPanel } from '../Harness.Panel.Debug';
import {
  COLORS,
  ErrorBoundary,
  css,
  Color,
  type t,
  useBusController,
  useRubberband,
  useSizeObserver,
} from '../common';
import { ErrorFallback } from './ErrorFallback';

type Size = { width: number; height: number };

export type HarnessProps = {
  instance?: t.DevInstance;
  spec?: t.SpecImport | t.TestSuiteModel;
  allowRubberband?: boolean;
  style?: t.CssValue;
  background?: string | number;
};

export const Harness: React.FC<HarnessProps> = (props) => {
  useRubberband(props.allowRubberband ?? false);

  const baseRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const subjectRef = useRef<HTMLDivElement>(null);
  const debugRef = useRef<HTMLDivElement>(null);
  const resize = useSizeObserver([baseRef, hostRef, subjectRef]);

  const controller = useBusController({
    bus: props.instance?.bus,
    id: props.instance?.id,
    bundle: props.spec,
    runOnLoad: true,
  });
  const { instance } = controller;

  /**
   * [Effects]
   */
  useEffect(() => {
    const events = controller.events;
    if (!events) return;
    if (!(resize.ready && controller.ready)) return;

    // Bubble resize events.
    events.props.change.fire((d) => {
      d.size.harness = toSize(baseRef.current);
      d.size.host = toSize(hostRef.current);
      d.size.subject = toSize(subjectRef.current);
      d.size.debug = toSize(debugRef.current);
    });

    events.redraw.subject();
  }, [controller.ready, resize.count, baseRef.current, hostRef.current, subjectRef.current]);

  /**
   * [Render]
   */
  const styles = {
    reset: css({
      color: COLORS.DARK,
      fontFamily: 'sans-serif',
      fontSize: 16,
    }),
    base: css({
      position: 'relative',
      backgroundColor: Color.format(props.background),
      pointerEvents: 'auto',
      display: 'grid',
      gridTemplateColumns: '1fr auto',
    }),
  };

  return (
    <div ref={baseRef} {...css(styles.reset, styles.base, props.style)}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <HarnessHost instance={instance} baseRef={hostRef} subjectRef={subjectRef} />
        <DebugPanel instance={instance} baseRef={debugRef} />
      </ErrorBoundary>
    </div>
  );
};

/**
 * Helpers
 */

const toSize = (el?: HTMLDivElement | null): Size => {
  if (!el) return { width: -1, height: -1 };
  const { width, height } = el.getBoundingClientRect();
  return { width, height };
};
