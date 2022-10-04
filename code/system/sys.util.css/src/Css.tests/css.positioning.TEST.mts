import { expect, describe, it } from '../test/index.mjs';
import { toPositionEdges } from '../Css/index.mjs';
import { Style } from '../index.mjs';

describe('React: transformStyle - positioning', () => {
  describe('converting from transformStyle - function', () => {
    it('converts an `Absolute` value (deep)', () => {
      const res = Style.transform({ Absolute: '10 20em 30px 40' }) as any;
      expect(res.position).to.equal('absolute');
      expect(res.top).to.equal(10);
      expect(res.right).to.equal('20em');
      expect(res.bottom).to.equal(30);
      expect(res.left).to.equal(40);
    });

    it('converts a `Fixed` value', () => {
      const res = Style.transform({ Fixed: '10 20em 30px 40' }) as any;
      expect(res.position).to.equal('fixed');
      expect(res.top).to.equal(10);
      expect(res.right).to.equal('20em');
      expect(res.bottom).to.equal(30);
      expect(res.left).to.equal(40);
    });

    it('converts array value (with null)', () => {
      const res = Style.transform({
        Absolute: ['10', null, '30px', '40em'],
      }) as any;
      expect(res.position).to.equal('absolute');
      expect(res.top).to.equal(10);
      expect(res.right).to.equal(undefined);
      expect(res.bottom).to.equal(30);
      expect(res.left).to.equal('40em');
    });

    it('single value', () => {
      const test = (input: Record<string, unknown>, position: string, value: number) => {
        const res = Style.transform(input);
        expect(res).to.eql({
          position,
          top: value,
          right: value,
          bottom: value,
          left: value,
        });
      };

      test({ Absolute: 0 }, 'absolute', 0);
      test({ Absolute: -0 }, 'absolute', 0);
      test({ Absolute: 1 }, 'absolute', 1);

      test({ Fixed: 0 }, 'fixed', 0);
      test({ Fixed: 1 }, 'fixed', 1);
    });

    it('does nothing with an [undefined] value', () => {
      expect(Style.transform({ Absolute: undefined })).to.eql({});
    });

    it('does nothing with an [empty-string] value', () => {
      expect(Style.transform({ Absolute: '' })).to.eql({});
    });
  });

  describe('AbsoluteCenter', function () {
    it('converts `x`', () => {
      const res = Style.transform({ AbsoluteCenter: 'x' }) as any;
      expect(res.position).to.equal('absolute');
      expect(res.left).to.equal('50%');
      expect(res.top).to.equal(undefined);
      expect(res.transform).to.equal('translateX(-50%)');
    });

    it('converts `y`', () => {
      const res = Style.transform({ AbsoluteCenter: 'y' }) as any;
      expect(res.position).to.equal('absolute');
      expect(res.left).to.equal(undefined);
      expect(res.top).to.equal('50%');
      expect(res.transform).to.equal('translateY(-50%)');
    });

    it('converts `xy`', () => {
      const res = Style.transform({ AbsoluteCenter: 'xy' }) as any;
      expect(res.position).to.equal('absolute');
      expect(res.left).to.equal('50%');
      expect(res.top).to.equal('50%');
      expect(res.transform).to.equal('translate(-50%, -50%)');
    });

    it('retains top value (x)', () => {
      const res = Style.transform({
        left: 0,
        top: 0,
        AbsoluteCenter: 'x',
      }) as any;
      expect(res.position).to.equal('absolute');
      expect(res.left).to.equal('50%');
      expect(res.top).to.equal(0);
      expect(res.transform).to.equal('translateX(-50%)');
    });

    it('retains left value (y)', () => {
      const res = Style.transform({
        left: 0,
        top: 0,
        AbsoluteCenter: 'y',
      }) as any;
      expect(res.position).to.equal('absolute');
      expect(res.left).to.equal(0);
      expect(res.top).to.equal('50%');
      expect(res.transform).to.equal('translateY(-50%)');
    });
  });

  describe('toPositionEdges', () => {
    it('all edges from string', () => {
      const res = toPositionEdges('Absolute', '10 20 30em 40') as any;
      expect(res.position).to.equal('absolute');
      expect(res.top).to.equal(10);
      expect(res.right).to.equal(20);
      expect(res.bottom).to.equal('30em');
      expect(res.left).to.equal(40);
    });

    it('string containing `null`', () => {
      const res = toPositionEdges('Absolute', '10 null 30em null') as any;
      expect(res.top).to.equal(10);
      expect(res.right).to.equal(undefined);
      expect(res.bottom).to.equal('30em');
      expect(res.left).to.equal(undefined);
    });

    describe('array', () => {
      it('all edges', () => {
        const res = toPositionEdges('Absolute', ['10', '20', '30em', '40']) as any;
        expect(res.top).to.equal(10);
        expect(res.right).to.equal(20);
        expect(res.bottom).to.equal('30em');
        expect(res.left).to.equal(40);
      });

      it('all edges (0)', () => {
        const res = toPositionEdges('Absolute', [0, 0, 0, 0]) as any;
        expect(res.top).to.equal(0);
        expect(res.right).to.equal(0);
        expect(res.bottom).to.equal(0);
        expect(res.left).to.equal(0);
      });

      it('empty array', () => {
        const res = toPositionEdges('Absolute', []) as any;
        expect(res).to.equal(undefined);
      });

      it('single value array [0]', () => {
        const res = toPositionEdges('Absolute', [0]) as any;
        expect(res.top).to.equal(0);
        expect(res.right).to.equal(0);
        expect(res.bottom).to.equal(0);
        expect(res.left).to.equal(0);
      });

      it('array containing `null` values', () => {
        const res = toPositionEdges('Absolute', [null, 10, null, null]) as any;
        expect(res.top).to.equal(undefined);
        expect(res.right).to.equal(10);
        expect(res.bottom).to.equal(undefined);
        expect(res.left).to.equal(undefined);
      });

      it('array containing all `null` values', () => {
        const res = toPositionEdges('Absolute', [null, null, null, null]) as any;
        expect(res).to.equal(undefined);
      });
    });

    describe('shorthand', () => {
      it('empty-string', () => {
        const res = toPositionEdges('Absolute', '') as any;
        expect(res).to.equal(undefined);
      });

      it('undefined', () => {
        const res = toPositionEdges('Absolute') as any;
        expect(res).to.equal(undefined);
      });

      it('1-value', () => {
        const res = toPositionEdges('Absolute', '10') as any;
        expect(res.top).to.equal(10);
        expect(res.right).to.equal(10);
        expect(res.bottom).to.equal(10);
        expect(res.left).to.equal(10);
      });

      it('1-value / Number', () => {
        const res = toPositionEdges('Absolute', 10) as any;
        expect(res.top).to.equal(10);
        expect(res.right).to.equal(10);
        expect(res.bottom).to.equal(10);
        expect(res.left).to.equal(10);
      });

      it('2-values', () => {
        const res = toPositionEdges('Absolute', '10 30em') as any;
        expect(res.top).to.equal(10);
        expect(res.right).to.equal('30em');
        expect(res.bottom).to.equal(10);
        expect(res.left).to.equal('30em');
      });

      it('3-values', () => {
        const res = toPositionEdges('Absolute', '10 30em 40') as any;
        expect(res.top).to.equal(10);
        expect(res.right).to.equal('30em');
        expect(res.left).to.equal('30em');
        expect(res.bottom).to.equal(40);
      });
    });
  });
});
