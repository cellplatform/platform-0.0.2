import { DEFAULT, R, t } from '../../common';

type O = Record<string, unknown>;

/**
 * Dynamic value.
 *    Used within the definitions of [DevTools] implementations
 *    when the value needs to be re-calculated upon state/prop updates.
 */
export function ValueHandler<V, State extends O>(events: t.DevEvents) {
  type Handler = t.DevValueHandler<V, State>;
  type Subscriber = (e: { value: V }) => void;

  events.dispose$.subscribe(() => api.dispose());

  let _isDisposed = false;
  let _latest: V | undefined;
  let _handler: t.DevValueHandler<V, State> | undefined;
  const subscribers = new Set<Subscriber>();

  const getCurrent = async (data?: t.DevInfo) => {
    const info = data ?? (await events.info.get());
    const state = (info.render.state ?? {}) as State;
    const dev = (info.render.props ?? DEFAULT.props) as t.DevRenderProps;
    const res = _handler?.({ state, dev });
    return res;
  };

  const onChanged = async (info?: t.DevInfo) => {
    const value = await getCurrent(info);
    if (value !== undefined && !R.equals(value, _latest)) {
      subscribers.forEach((fn) => fn({ value }));
    }
    _latest = value;
  };

  events.state.changed$.subscribe((e) => onChanged(e.info));
  events.props.changed$.subscribe((e) => onChanged(e.info));

  const api = {
    get current() {
      return _latest;
    },
    handler(input: V | Handler) {
      _handler = (typeof input === 'function' ? input : () => input as V) as Handler;
      onChanged();
      return api;
    },
    subscribe(fn: Subscriber) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
    dispose() {
      subscribers.clear();
      _handler = undefined;
      _isDisposed = true;
    },
    get disposed() {
      return _isDisposed;
    },
  };

  return api;
}
