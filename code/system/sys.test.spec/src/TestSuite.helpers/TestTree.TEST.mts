import { Test } from '../index.mjs';
import { describe, expect, it, t } from '../test';
import { TestTree, WalkDownArgs, WalkUpArgs } from '.';

type T = t.TestSuiteModel | t.TestModel;

describe('TestTree ("Hierarchy")', () => {
  const createRoot = async () => {
    const root = await Test.describe('root', (e) => {
      e.it('1', (e) => null);
      e.describe('2', (e) => {
        e.it('2.1', () => null);
        e.describe('2.2', (e) => {
          e.describe('2.2.1', (e) => {
            e.it('2.2.1.1');
            e.it('2.2.1.2');
          });
        });
      });
      e.it('3', (e) => null);
    }).init();

    const findSuite = (description: string) =>
      TestTree.findOne(root, (e) => e.suite.toString() === description).suite;

    const findTest = (description: string) =>
      TestTree.findOne(root, (e) => e.test?.toString() === description).test;

    return { root, findSuite, findTest };
  };

  it('parent', async () => {
    const { root, findTest, findSuite } = await createRoot();

    expect(TestTree.parent(findTest('2.1'))?.state.description).to.eql('2');
    expect(TestTree.parent(findSuite('2'))).to.eql(root);
    expect(TestTree.parent(root)).to.eql(undefined);
    expect(TestTree.parent()).to.eql(undefined);
  });

  it('root', async () => {
    const { root, findTest, findSuite } = await createRoot();

    const test = (child: T | undefined, expected: t.TestSuiteModel | undefined) => {
      expect(TestTree.root(child)).to.equal(expected);
    };

    test(undefined, undefined);
    test(root, root);

    test(findSuite('2'), root);
    test(findSuite('2.2.1'), root);
    test(findTest('2.2.1.1'), root);
    test(findTest('3'), root);
  });

  it('walkDown', async () => {
    const { root } = await createRoot();

    const list: WalkDownArgs[] = [];
    TestTree.walkDown(root, (e) => list.push(e));

    const flat = list.map((item) => item.test?.toString() || item.suite.toString());
    expect(flat).to.eql(['root', '1', '3', '2', '2.1', '2.2', '2.2.1', '2.2.1.1', '2.2.1.2']);
  });

  it('walkUp', async () => {
    const { findTest } = await createRoot();
    const from = findTest('2.2.1.2');

    const list: WalkUpArgs[] = [];
    TestTree.walkUp(from, (e) => list.push(e));

    const flat = list.map((item) => item.suite.toString());
    expect(flat).to.eql(['2.2.1', '2.2', '2', 'root']);
    expect(list.map((item) => item.isRoot)).to.eql([false, false, false, true]);
  });

  it('find', async () => {
    const { root } = await createRoot();
    const res1 = TestTree.find(root, (e) => e.test?.toString() === '2.2.1.1');
    const res2 = TestTree.find(root, (e) => e.test?.toString() === '404');
    const res3 = TestTree.find(root, (e) => e.suite.toString() === '2.2.1');
    const res4 = TestTree.find(root, (e) => e.suite.toString() === '2.2.1', { limit: 1 });

    expect(res1[0]?.test?.toString()).to.eql('2.2.1.1');
    expect(res2).to.eql([]);
    expect(res3.length).to.eql(3);
    expect(res3[0]?.suite.toString()).to.eql('2.2.1');
    expect(res3[1]?.test?.toString()).to.eql('2.2.1.1');
    expect(res3[2]?.test?.toString()).to.eql('2.2.1.2');
    expect(res4.length).to.eql(1);
  });

  it('findOne', async () => {
    const { root } = await createRoot();
    const res1 = TestTree.findOne(root, (e) => e.test?.toString() === '2.2.1.1');
    const res2 = TestTree.findOne(root, (e) => e.test?.toString() === '404');
    const res3 = TestTree.findOne(root, (e) => e.suite.toString() === '2.2.1');

    expect(res1?.test?.toString()).to.eql('2.2.1.1');
    expect(res2).to.eql(undefined);
    expect(res3?.suite.toString()).to.eql('2.2.1');
  });

  it('siblings', async () => {
    const { findTest, findSuite } = await createRoot();

    const test = (item: T | undefined, expected: string[]) => {
      const siblings = TestTree.siblings(item);
      const descriptions = siblings.map((item) => item.toString());
      expect(descriptions).to.eql(expected);
    };

    test(undefined, []);
    test(findTest('1'), ['2', '3']);
    test(findSuite('2'), ['1', '3']);
    test(findTest('2.2.1.1'), ['2.2.1.2']);
    test(findSuite('2.2.1'), []);
  });
});
