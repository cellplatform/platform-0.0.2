import { describe, it, expect, t, TestPrep, FsMock } from '../TEST/index.mjs';

describe('BusController.Change', function () {
  async function changeSetup<T extends t.SysFsChange>() {
    const mock = TestPrep();
    const { events, dispose } = mock;
    const io = events.io;

    const file = FsMock.randomFile();
    const fired: T[] = [];
    events.changed$.subscribe((e) => fired.push(e.change as T));

    return { events, dispose, fired, io, file };
  }

  it('write', async () => {
    const test = await changeSetup<t.SysFsChangeWrite>();
    const { hash, data } = test.file;
    const path = '/foo/bar/kitten.jpg';

    await test.io.write.fire({ path, hash, data });

    expect(test.fired.length).to.eql(1);
    expect(test.fired[0].op).to.eql('write');

    const file = test.fired[0].files[0];
    expect(file.path).to.eql(path);
    expect(file.hash).to.eql(hash);

    test.dispose();
  });

  it('copy', async () => {
    const test = await changeSetup<t.SysFsChangeCopy>();
    const { hash, data } = test.file;

    await test.io.write.fire({ path: 'kitten.jpg', hash, data });
    await test.io.copy.fire({ source: 'kitten.jpg', target: 'cats/howl.jpg' });

    expect(test.fired.length).to.eql(2);
    expect(test.fired[0].op).to.eql('write');
    expect(test.fired[1].op).to.eql('copy');

    const file = test.fired[1].files[0];
    expect(file.source).to.eql('/kitten.jpg');
    expect(file.target).to.eql('/cats/howl.jpg');
    expect(file.hash).to.eql(hash);

    test.dispose();
  });

  it('move', async () => {
    const test = await changeSetup<t.SysFsChangeMove>();
    const { hash, data } = test.file;

    await test.io.write.fire({ path: 'kitten.jpg', hash, data });
    await test.io.move.fire({ source: 'kitten.jpg', target: 'cats/howl.jpg' });

    expect(test.fired.length).to.eql(2);
    expect(test.fired[0].op).to.eql('write');
    expect(test.fired[1].op).to.eql('move');

    const file = test.fired[1].files[0];
    expect(file.source).to.eql('/kitten.jpg');
    expect(file.target).to.eql('/cats/howl.jpg');
    expect(file.hash).to.eql(hash);

    test.dispose();
  });

  it('delete', async () => {
    const test = await changeSetup<t.SysFsChangeDelete>();
    const { hash, data } = test.file;

    await test.io.write.fire({ path: 'kitten.jpg', hash, data });
    await test.io.delete.fire('kitten.jpg');

    expect(test.fired.length).to.eql(2);
    expect(test.fired[0].op).to.eql('write');
    expect(test.fired[1].op).to.eql('delete');

    const file = test.fired[1].files[0];
    expect(file.path).to.eql('/kitten.jpg');
    expect(file.hash).to.eql(hash);

    test.dispose();
  });

  /**
   * TODO 🐷
   */
  describe.skip('no change (event not fired)', () => {
    it.skip('write', async () => {
      //
    });
    it.skip('copy', async () => {
      //
    });
    it.skip('move', async () => {
      //
    });
    it.skip('delete', async () => {
      //
    });
  });
});
