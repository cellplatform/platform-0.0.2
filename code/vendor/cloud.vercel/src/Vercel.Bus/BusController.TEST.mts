import { describe, expect, it, rx, t, TestFilesystem } from '../Test/index.mjs';
import { DEFAULT } from './common.mjs';
import { BusController, BusEvents } from './index.mjs';

describe('BusController', () => {
  const token = process.env.VERCEL_TEST_TOKEN || '';
  const bus = rx.bus<t.VercelEvent>();
  const busid = rx.bus.instance(bus);
  const instance = { bus };
  const fs = TestFilesystem.memory().fs;

  describe('Info', () => {
    it('defaults', async () => {
      const controller = BusController({ instance, token, fs });
      const events = BusEvents({ instance });

      const res = await events.info.get();
      controller.dispose();

      expect(controller.instance.id).to.eql(DEFAULT.id);
      expect(controller.instance.bus).to.eql(busid);
      expect(controller.events.instance.id).to.eql(DEFAULT.id);
      expect(events.instance.id).to.eql(DEFAULT.id);
      expect(events.instance.bus).to.eql(busid);

      const endpoint = res.info?.endpoint;
      expect(endpoint?.alive).to.eql(true);
      expect(endpoint?.error).to.eql(undefined);

      const user = endpoint?.user;
      expect(typeof user?.uid).to.eql('string');
      expect(typeof user?.email).to.eql('string');
      expect(typeof user?.name).to.eql('string');
      expect(typeof user?.username).to.eql('string');
    });

    it('explicit id', async () => {
      const id = 'my-instance';
      const controller = BusController({ instance: { bus, id }, token, fs });

      expect(controller.instance.id).to.eql(id);
      expect(controller.instance.bus).to.eql(busid);
      expect(controller.events.instance.id).to.eql(id);
      expect(controller.events.instance.bus).to.eql(busid);
    });

    it('filter', async () => {
      let allow = true;
      const controller = BusController({ instance, token, fs, filter: (e) => allow });
      const events = BusEvents({ instance });

      const res1 = await events.info.get();
      allow = false;

      const res2 = await events.info.get({ timeout: 10 });
      controller.dispose();

      expect(res1.error).to.eql(undefined);
      expect(res2.error).to.include('timed out');
    });
  });
});
