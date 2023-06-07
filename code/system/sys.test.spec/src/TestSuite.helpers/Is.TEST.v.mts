import { Test } from '../index.mjs';
import { describe, expect, it, t } from '../test';
import { TestModel } from '../TestSuite/TestModel.mjs';
import { Is } from './Is.mjs';

describe('Is (flags)', () => {
  it('Test.Is', () => {
    expect(Test.Is).to.equal(Is);
  });

  it('Is.suite', () => {
    const test = (input: any, expected: boolean) => {
      expect(Is.suite(input)).to.eql(expected);
    };
    test(Test.describe('foo'), true);

    [undefined, null, '', true, 123, [], {}, () => null].forEach((value) => test(value, false));
    test(TestModel({ parent: Test.describe('foo'), description: 'name' }), false);
  });

  it('Is.suiteId', () => {
    const test = (input: any, expected: boolean) => {
      expect(Is.suiteId(input)).to.eql(expected);
    };
    [undefined, null, '', true, 123, [], {}, () => null].forEach((value) => test(value, false));
    test('TestSuite.abc123', true);
  });

  it('Is.test', () => {
    const description = 'foo';
    const parent = Test.describe('root');
    const test = (input: any, expected: boolean) => {
      expect(Is.test(input)).to.eql(expected);
    };

    [undefined, null, '', true, 123, [], {}, () => null].forEach((value) => test(value, false));
    test(Test.describe('foo'), false);

    test(TestModel({ parent, description }), true);
  });

  it('Is.testId', () => {
    const test = (input: any, expected: boolean) => {
      expect(Is.testId(input)).to.eql(expected);
    };
    [undefined, null, '', true, 123, [], {}, () => null].forEach((value) => test(value, false));
    test('Test.abc123', true);
  });

  it('Is.testArgs', async () => {
    let _args: t.TestHandlerArgs | undefined;
    const suite = Test.describe('root', (e) => {
      e.it('test', (e) => (_args = e));
    });
    await suite.run();

    const test = (input: any, expected: boolean) => {
      expect(Is.testArgs(input)).to.eql(expected);
    };

    [undefined, null, '', true, 123, [], {}, () => null].forEach((value) => test(value, false));
    test(_args, true);
  });

  it('Is.results', async () => {
    const root = Test.describe('foo');
    const test = (input: any, expected: boolean) => {
      expect(Is.results(input)).to.eql(expected);
    };

    [undefined, null, '', true, 123, [], {}, () => null].forEach((value) => test(value, false));

    const results = await Test.run(root);
    test(results, true);
  });
});
