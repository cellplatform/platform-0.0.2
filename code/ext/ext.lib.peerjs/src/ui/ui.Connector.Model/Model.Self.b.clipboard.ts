import { Data } from './u.Data';
import { DEFAULTS, PeerUri, Time, slug, type t } from './common';

export function clipboardBehavior(args: {
  ctx: t.GetConnectorCtx;
  state: t.ConnectorItemStateSelf;
  events: t.ConnectorItemStateSelfEvents;
  dispatch: t.LabelItemDispatch;
}) {
  const { events, state, dispatch } = args;
  const redraw = dispatch.redraw;

  /**
   * Behavior: Copy
   */
  const copyClipboard = async () => {
    const peerid = Data.self(state).peerid;
    await navigator.clipboard.writeText(PeerUri.uri(peerid));

    const tx = slug();
    state.change((item) => (Data.self(item).actionCompleted = { tx, message: 'copied' }));
    redraw();

    Time.delay(DEFAULTS.timeout.copiedPending, () => {
      if (Data.self(state).actionCompleted?.tx !== tx) return;
      state.change((item) => (Data.self(item).actionCompleted = undefined));
      redraw();
    });
  };

  /**
   * UI Events (Incoming)
   */
  events.cmd.clipboard.copy$.subscribe(copyClipboard);
  events.cmd.action.kind('self:right').subscribe(copyClipboard);
}
