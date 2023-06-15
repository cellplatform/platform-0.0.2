import { DEFAULTS, describe, expect, it, t } from '../test';
import { Is } from './Is.mjs';
import { Wrangle } from './Wrangle.mjs';

const { NULL_RANGE } = DEFAULTS;

describe('Is', () => {
  it('Is.editorRange', () => {
    const test = (input: any, expected: boolean) => {
      const res = Is.editorRange(input);
      expect(res).to.eql(expected);
    };

    const range: t.EditorRange = {
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1,
    };
    test(range, true);
    [null, undefined, '', 123, [], {}, true].forEach((input) => test(input, false));
  });

  it('Is.charPositionTuple', () => {
    const test = (input: any, expected: boolean) => {
      const res = Is.charPositionTuple(input);
      expect(res).to.eql(expected);
    };

    const tuple: t.CharPositionTuple = [2, 5];
    test(tuple, true);
    [null, undefined, '', 123, [], {}, true].forEach((input) => test(input, false));
  });

  it('Is.nullRange', () => {
    expect(Is.nullRange(Wrangle.asRange([1, 5]))).to.eql(false);
    expect(Is.nullRange(NULL_RANGE)).to.eql(true);
  });

  it('Is.singleCharRange', () => {
    const range1 = Wrangle.asRange([1, 5]);
    const range2 = Wrangle.asRange([1, 5, 1, 6]);

    expect(Is.singleCharRange(range1)).to.eql(true);
    expect(Is.singleCharRange(range2)).to.eql(false);
  });

  it('Is.rangeWithinText', () => {
    const test = (expected: boolean, range: t.EditorRangeInput, text: string) => {
      const res = Is.rangeWithinString(range, text);
      expect(res).to.eql(expected);
    };

    test(false, null, 'hello');
    test(false, [-1, -1], 'hello');

    test(true, [1, 6], 'hello');
    test(false, [1, 7], 'hello');

    test(true, [1, 1], '');
    test(false, [1, 2], '');

    test(true, [1, 1], 'h');
    test(true, [1, 2], 'h');
    test(false, [1, 3], 'h');
  });
});
