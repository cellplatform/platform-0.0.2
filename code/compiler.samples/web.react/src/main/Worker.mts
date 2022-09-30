import { filter } from 'rxjs/operators';
import { rx, slug } from 'sys.util';
import * as t from './types.mjs';

const ctx: t.WorkerGlobalScope = self as any;
const id = ctx.name;

const bus = rx.bus<t.NetworkMessageEvent>();

bus.$.subscribe((e) => {
  console.info(`💦 bus:`, e.payload);
});

/**
 * Log worker init.
 */
console.group('💦 worker');
// console.info('- pump:', pump);
console.info(`- localbus:`, bus);
console.info('- self:', self);
console.groupEnd();

/**
 * INCOMING message
 */
ctx.addEventListener('message', (e) => {
  if (!isNetworkMessage(e.data)) return;

  const event = e.data as t.NetworkMessageEvent;
  const payload = event.payload;

  if (typeof payload.target === 'string' && payload.target !== id) return;
  bus.fire(event);
});

/**
 * OUTGOING
 */
bus.$.pipe(
  filter((e) => e.type === 'Network/message'),
  filter((e) => e.payload.sender === id),
).subscribe((e) => {
  ctx.postMessage(e);
});

function isNetworkMessage(data: any) {
  if (typeof data !== 'object') return false;
  if (data.type !== 'Network/message') return false;
  if (typeof data.payload.sender !== 'string') return false;
  if (typeof data.payload.tx !== 'string') return false;
  return rx.isEvent(data.payload.event);
}

let _count = 0;
const fireSample = () => {
  _count++;
  bus.fire({
    type: 'Network/message',
    payload: {
      tx: slug(),
      sender: id,
      event: { type: 'foo', payload: { msg: `Hello from "${id}" 💦`, count: _count } },
    },
  });
};

/**
 * TEST Pump
 */
fireSample();
