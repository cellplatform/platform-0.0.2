import { expect, describe, it } from '../Test/index.mjs';
import { Observable, Subject } from 'rxjs';
import { t } from '../common/index.mjs';

import { rx } from './index.mjs';

describe('rx.bus', () => {
  describe('isBus', () => {
    it('is bus', () => {
      const test = (input: any) => {
        expect(rx.isBus(input)).to.eql(true);
      };
      test({ $: new Observable(), fire: () => null });
      test(rx.bus());
    });

    it('is not a bus', () => {
      const test = (input: any) => {
        expect(rx.isBus(input)).to.eql(false);
      };
      test(undefined);
      test(null);
      test(123);
      test({});
      test([123, {}]);
      test({ event$: new Observable() });
      test({ $: new Observable() });
      test({ fire: () => null });
    });
  });

  describe('busAsType', () => {
    type MyEvent = IFooEvent | IBarEvent;
    type IFooEvent = { type: 'Event/foo'; payload: { count?: number } };
    type IBarEvent = { type: 'Event/bar'; payload: { count?: number } };

    it('changes event type', () => {
      const bus1 = rx.bus();

      const fired: t.Event[] = [];
      bus1.$.subscribe((e) => fired.push(e));

      const bus2 = rx.busAsType<MyEvent>(bus1);
      bus2.fire({ type: 'Event/bar', payload: {} });

      expect(fired.length).to.eql(1);
      expect(fired[0].type).to.eql('Event/bar');
    });
  });

  describe('bus (factory)', () => {
    type MyEvent = IFooEvent | IBarEvent;
    type IFooEvent = { type: 'Event/foo'; payload: { count?: number } };
    type IBarEvent = { type: 'Event/bar'; payload: { count?: number } };

    it('_instance (hidden "id")', () => {
      const bus = rx.bus();
      const _instance = (bus as any)._instance as string;
      expect(typeof _instance).to.eql('string');
      expect(_instance.startsWith('bus.')).to.eql(true);
      expect(_instance.length).to.greaterThan('bus.'.length);
    });

    it('rx.bus.instance(...)', () => {
      const bus = rx.bus();
      const _instance = (bus as any)._instance as string;
      expect(rx.bus.instance(bus)).to.eql(_instance);
      expect(rx.bus.instance({} as any)).to.eql('');
    });

    it('create: new observable (no param, no type)', () => {
      const bus = rx.bus();

      const fired: t.Event[] = [];
      bus.$.subscribe((e) => fired.push(e));

      bus.fire({ type: 'ANY', payload: {} });

      expect(fired.length).to.eql(1);
      expect(fired[0].type).to.eql('ANY');
    });

    it('create: use given subject', () => {
      const source$ = new Subject<any>(); // NB: Does not care the typing of the input observable (flexible).
      const bus = rx.bus<MyEvent>(source$);

      const fired: MyEvent[] = [];
      bus.$.subscribe((e) => fired.push(e));

      source$.next({ type: 'ANY', payload: {} });

      bus.fire({ type: 'Event/foo', payload: {} });

      expect(fired.length).to.eql(2);
      expect(fired[0].type).to.eql('ANY');
      expect(fired[1].type).to.eql('Event/foo');
    });

    it('create: use given bus', () => {
      const bus1 = rx.bus();
      const bus2 = rx.bus(bus1);
      expect(bus2).to.equal(bus1);
    });

    it('filters out non-standard [event] objects from the stream', () => {
      const source$ = new Subject<any>();
      const bus = rx.bus<MyEvent>(source$);

      const fired: MyEvent[] = [];
      bus.$.subscribe((e) => fired.push(e));

      // NB: All data-types that do not conform to the shape of a [Event].
      source$.next(undefined);
      source$.next(null);
      source$.next(1);
      source$.next(true);
      source$.next('two');
      source$.next({});
      source$.next({ type: 123, payload: {} });
      source$.next({ type: 'FOO' });
      source$.next({ type: 'FOO', payload: 123 });

      expect(fired.length).to.eql(0);
    });

    it('bus.isBus', () => {
      expect(rx.bus.isBus).to.equal(rx.isBus);
    });

    it('bus.asType', () => {
      expect(rx.bus.asType).to.equal(rx.busAsType);
    });

    it('bus.pump', () => {
      expect(rx.bus.pump).to.equal(rx.pump);
    });
  });
});
