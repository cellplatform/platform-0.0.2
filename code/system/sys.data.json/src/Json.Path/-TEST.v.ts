import { describe, it, expect, type t } from '../test';
import { Path } from '.';

describe('Json.Path', () => {
  describe('resolve', () => {
    type R = typeof root;
    const root = {
      msg: 'hello',
      child: { foo: { count: 123 }, bar: null },
      list: [1, { msg: 'two' }, ['a', 'b', null]],
    };

    it('returns {root} ← param []', () => {
      const res = Path.resolve<R>(root, []);
      expect(res).to.eql(root);
    });

    it('returns match', () => {
      const res1 = Path.resolve<R>(root, ['msg']);
      const res2 = Path.resolve<R>(root, ['child']);
      const res3 = Path.resolve<R>(root, ['child', 'foo']);
      const res4 = Path.resolve<R>(root, ['child', 'foo', 'count']);
      const res5 = Path.resolve<R>(root, ['child', 'bar']);

      expect(res1).to.eql('hello');
      expect(res2).to.equal(root.child);
      expect(res3).to.equal(root.child.foo);
      expect(res4).to.eql(123);
      expect(res5).to.eql(null);
    });

    it('matches when root is an [array]', () => {
      expect(Path.resolve<R>([], [0])).to.equal(undefined);
      expect(Path.resolve<R>([root], [0, 'msg'])).to.equal('hello');
      expect(Path.resolve<R>([root, root], [1, 'list', 2, '0'])).to.equal('a');
    });

    it('interprets numbers as indexes', () => {
      expect(Path.resolve<R>(root, ['list', 0])).to.eql(1);
      expect(Path.resolve<R>(root, ['list', '0'])).to.eql(1);
      expect(Path.resolve<R>(root, ['list', '0 '])).to.eql(undefined); // NB: space in path
      expect(Path.resolve<R>(root, ['list', 1])).to.equal(root.list[1]);
      expect(Path.resolve<R>(root, ['list', 2, 1])).to.eql('b');
      expect(Path.resolve<R>(root, ['list', 2, 999])).to.eql(undefined);
      expect(Path.resolve<R>(root, ['list', 2, 2])).to.eql(null);
    });

    it('throws if root not an object', () => {
      [null, undefined, 123, true, ''].forEach((value) => {
        const fn = () => Path.resolve(value as any, []);
        expect(fn).to.throw(/root is not an object/);
      });
    });
  });
});