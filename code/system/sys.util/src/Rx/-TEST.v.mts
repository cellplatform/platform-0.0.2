import { expect, describe, it } from '../test';
import { Time } from '../Time';
import { disposable } from './Rx.lifecycle.mjs';

import { rx } from '.';

describe('rx', () => {
  describe('rx.subject (factory)', () => {
    it('void', () => {
      let fired = 0;
      const subject = rx.subject();

      subject.subscribe(() => fired++);
      subject.next();
      expect(fired).to.eql(1);

      subject.complete();
      subject.next();
      expect(fired).to.eql(1);
    });

    it('<T>', () => {
      type T = { type: string };
      const subject = rx.subject<T>();
      const fired: T[] = [];
      subject.subscribe((e) => fired.push(e));
      subject.next({ type: 'foo' });
      expect(fired[0]).to.eql({ type: 'foo' });
    });
  });

  describe('rx.event | rx.payload', () => {
    type FooEvent = { type: 'TYPE/foo'; payload: Foo };
    type Foo = { count: number };

    type BarEvent = { type: 'TYPE/bar'; payload: Bar };
    type Bar = { msg: string };

    it('rx.event', () => {
      const source$ = new rx.Subject<FooEvent | BarEvent>();

      const fired: FooEvent[] = [];
      rx.event<FooEvent>(source$, 'TYPE/foo').subscribe((e) => fired.push(e));

      source$.next({ type: 'TYPE/bar', payload: { msg: 'hello' } });
      source$.next({ type: 'TYPE/foo', payload: { count: 123 } });
      source$.next({ type: 'TYPE/bar', payload: { msg: 'hello' } });

      expect(fired.length).to.eql(1);
      expect(fired[0].type).to.eql('TYPE/foo');
      expect(fired[0].payload).to.eql({ count: 123 });
    });

    it('rx.payload', () => {
      const source$ = new rx.Subject<FooEvent | BarEvent>();

      const fired: Foo[] = [];
      rx.payload<FooEvent>(source$, 'TYPE/foo').subscribe((e) => fired.push(e));

      source$.next({ type: 'TYPE/bar', payload: { msg: 'hello' } });
      source$.next({ type: 'TYPE/foo', payload: { count: 123 } });
      source$.next({ type: 'TYPE/bar', payload: { msg: 'hello' } });

      expect(fired.length).to.eql(1);
      expect(fired[0]).to.eql({ count: 123 });
    });
  });

  describe('rx.isEvent', () => {
    const test = (input: any, expected: boolean) => {
      expect(rx.isEvent(input)).to.eql(expected);
    };

    it('is an event', () => {
      test({ type: 'MyEvent', payload: {} }, true);
    });

    it('is not an event', () => {
      test(undefined, false);
      test(null, false);
      test(1, false);
      test(true, false);
      test('two', false);
      test({}, false);
      test({ type: 123, payload: {} }, false);
      test({ type: 'FOO' }, false);
      test({ type: 'FOO', payload: 123 }, false);
    });

    it('is an event of given type', () => {
      const test = (input: any, type: any, expected: boolean) => {
        expect(rx.isEvent(input, type)).to.eql(expected);
      };

      test(undefined, 'foo', false);
      test(null, 'foo', false);
      test(123, 'foo', false);
      test({}, 'foo', false);
      test({ type: 'foo', payload: {} }, 'bar', false);

      test({ type: 'foo', payload: {} }, 'foo', true);
      test({ type: 'foo/bar', payload: {} }, { startsWith: 'foo/bar' }, true);
      test({ type: 'foo/bar', payload: {} }, { startsWith: 'foo/' }, true);
      test({ type: 'foo/bar', payload: {} }, { startsWith: 'foo' }, true);

      test({ type: 'foo', payload: {} }, '  foo  ', false);
      test({ type: 'foo', payload: {} }, 123, false);
      test({ type: 'foo', payload: {} }, null, false);
      test({ type: 'foo', payload: {} }, {}, false);
      test({ type: 'foo/bar', payload: {} }, { startsWith: undefined }, false);
      test({ type: 'foo/bar', payload: {} }, { startsWith: null }, false);
    });
  });

  describe('rx.disposable', () => {
    it('method: dispose', () => {
      const { dispose$, dispose } = rx.disposable();

      let count = 0;
      dispose$.subscribe(() => count++);

      dispose();
      dispose();
      dispose();

      expect(count).to.eql(1); // NB: Multiple calls only fire the observable event once.
    });

    it('until$', () => {
      const until$ = new rx.Subject<number>();
      const { dispose$ } = rx.disposable(until$);

      let count = 0;
      dispose$.subscribe(() => count++);
      expect(count).to.eql(0);

      until$.next(123);
      until$.next(456);
      expect(count).to.eql(1);
    });

    it('lifecycle', () => {
      const until$ = new rx.Subject<number>();
      const lifecycleA = rx.lifecycle([undefined, [undefined, [undefined, [until$]]]]);
      const lifecycleB = rx.lifecycle();

      const count = { a: 0, b: 0 };
      lifecycleA.dispose$.subscribe(() => count.a++);
      lifecycleB.dispose$.subscribe(() => count.b++);

      expect(lifecycleA.disposed).to.eql(false);
      expect(lifecycleB.disposed).to.eql(false);

      until$.next(123);
      expect(lifecycleA.disposed).to.eql(true);
      expect(lifecycleB.disposed).to.eql(false);
      expect(count).to.eql({ a: 1, b: 0 });

      lifecycleA.dispose(); // NB: No effect.
      lifecycleB.dispose();

      expect(lifecycleA.disposed).to.eql(true);
      expect(lifecycleB.disposed).to.eql(true);
      expect(count).to.eql({ a: 1, b: 1 });
    });

    it('rx.done() - fires and completes the subject', () => {
      const dispose$ = new rx.Subject<void>();

      let count = 0;
      dispose$.subscribe((e) => count++);

      rx.done(dispose$);
      rx.done(dispose$);
      rx.done(dispose$);

      expect(count).to.eql(1);
    });
  });

  describe('rx.asPromise', () => {
    type E = { type: 'foo'; payload: { count: number } };

    describe('first', () => {
      it('resolves first response', async () => {
        const $ = new rx.Subject<E>();
        const promise = rx.asPromise.first<E>(rx.payload<E>($, 'foo'));

        $.next({ type: 'foo', payload: { count: 1 } });
        $.next({ type: 'foo', payload: { count: 2 } });
        $.next({ type: 'foo', payload: { count: 3 } });

        const res = await promise;
        expect(res.payload).to.eql({ count: 1 });
        expect(res.error).to.eql(undefined);
      });

      it('error: completed observable', async () => {
        const $ = new rx.Subject<E>();
        $.complete();

        const res = await rx.asPromise.first<E>(rx.payload<E>($, 'foo'));

        expect(res.payload).to.eql(undefined);
        expect(res.error?.code).to.eql('completed');
        expect(res.error?.message).to.include('The given observable has already "completed"');
      });

      it('error: timeout', async () => {
        const $ = new rx.Subject<E>();
        const res = await rx.asPromise.first<E>(rx.payload<E>($, 'foo'), { timeout: 10 });
        expect(res.payload).to.eql(undefined);
        expect(res.error?.code).to.eql('timeout');
        expect(res.error?.message).to.include('Timed out after 10 msecs');
      });

      it('error: timeout ("op")', async () => {
        const op = 'foobar';
        const $ = new rx.Subject<E>();
        const res = await rx.asPromise.first<E>(rx.payload<E>($, 'foo'), { op, timeout: 10 });
        expect(res.payload).to.eql(undefined);
        expect(res.error?.code).to.eql('timeout');
        expect(res.error?.message).to.include('Timed out after 10 msecs');
        expect(res.error?.message).to.include(`[${op}]`);
      });
    });
  });

  describe('rx.isObservable', () => {
    it('is an observable', () => {
      const $ = new rx.Subject<string>() as unknown;
      expect(rx.isObservable($)).to.eql(true);
      if (rx.isObservable<string>($)) {
        $.subscribe(); // NB: observable type inferred.
      }
    });

    it('is not observable', () => {
      [undefined, null, 0, true, [], {}, 'a'].forEach((value) => {
        expect(rx.isObservable(value)).to.eql(false);
      });
    });

    it('exposed from rx.bus', () => {
      expect(rx.isObservable).to.equal(rx.bus.isObservable);
    });
  });

  describe('rx.withinTimeThreshold (eg. "double-click")', () => {
    const $ = new rx.Subject<void>();

    it('fires within time-threshold', async (e) => {
      const threshold = rx.withinTimeThreshold($, 30);
      let fired = 0;
      threshold.$.subscribe(() => fired++);

      $.next();
      await Time.wait(5);
      $.next();
      expect(fired).to.eql(1);

      threshold.dispose();
    });

    it('does not fire (outside time-threshold)', async (e) => {
      const threshold = rx.withinTimeThreshold($, 5);
      let fired = 0;
      threshold.$.subscribe(() => fired++);

      $.next();
      await Time.wait(10);
      $.next();
      expect(fired).to.eql(0);

      threshold.dispose();
    });

    it('dispose', async (e) => {
      const threshold = rx.withinTimeThreshold($, 10);
      expect(threshold.disposed).to.eql(false);

      let fired = 0;
      threshold.$.subscribe(() => fired++);

      threshold.dispose();
      expect(threshold.disposed).to.eql(true);

      $.next();
      await Time.wait(2);
      $.next();

      await Time.wait(50);
      expect(fired).to.eql(0);
    });

    it('dispose$', async (e) => {
      const { dispose, dispose$ } = disposable();

      const threshold = rx.withinTimeThreshold($, 10, { dispose$ });
      expect(threshold.disposed).to.eql(false);

      expect(threshold.disposed).to.eql(false);
      dispose();
      expect(threshold.disposed).to.eql(true);
    });
  });
});
