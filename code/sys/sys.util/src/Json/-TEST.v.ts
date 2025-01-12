import { t, expect, describe, it } from '../test';
import { Json } from '.';

describe('Json', () => {
  describe('Json.stringify', () => {
    describe('complex values (multi-line, double-spaces, trailing new-line char)', () => {
      it('{ object }', () => {
        const obj = { foo: 123 };
        const res = Json.stringify(obj);
        expect(res).to.include('  "foo":');
        expect(res.includes('\n')).to.eql(true);
        expect(res[res.length - 2]).to.eql('}');
        expect(res[res.length - 1]).to.eql('\n');
      });

      it('[ array ]', () => {
        const obj = ['foo', 123];
        const res = Json.stringify(obj);
        expect(res).to.include('  "foo",\n');
        expect(res[res.length - 2]).to.eql(']');
        expect(res[res.length - 1]).to.eql('\n');
      });
    });

    describe('primitive values (single-line string)', () => {
      const test = (input: t.Json, expected: string) => {
        const res = Json.stringify(input);
        expect(res.includes('\n')).to.eql(false);
        expect(res).to.eql(expected);
        expect(JSON.parse(res)).to.eql(input);
      };

      it('write: null', () => test(null, 'null'));
      it('write: string', () => test('hello', '"hello"'));
      it('write: number', () => test(1234, '1234'));
      it('write: boolean', () => {
        test(true, 'true');
        test(false, 'false');
      });

      it('throw: [undefined]', () => {
        const fn = () => Json.stringify(undefined as any);
        expect(fn).to.throw(/\[undefined\] is not valid JSON input/);
      });
    });
  });

  describe('Json.parse', () => {
    it('parses simple values', () => {
      const test = (input: any) => {
        const text = Json.stringify(input);
        const res = Json.parse(text, input);
        expect(res).to.eql(input);
      };
      test(true);
      test('hello');
      test(123);
      test([123]);
      test({ msg: 123 });
      test(null);
    });

    it('undefined: returns default value', () => {
      const obj = { foo: 123 };
      const res1 = Json.parse(undefined, obj);
      const res2 = Json.parse(undefined, () => obj);
      expect(res1).to.equal(obj);
      expect(res2).to.equal(obj);
    });
  });
});
