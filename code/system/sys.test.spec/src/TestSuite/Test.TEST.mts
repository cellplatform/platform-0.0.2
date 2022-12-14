import { Test } from '.';
import { describe, expect, it, t } from '../test';
import { TestTree, Is } from '../TestSuite.helpers';

describe('Test (Root/Entry)', () => {
  it('Is', () => {
    expect(Test.Is).to.equal(Is);
  });

  describe('Test.bundle', () => {
    it('nothing [<empty>]', async () => {
      const bundle = await Test.bundle([]);
      expect(bundle.state.children).to.eql([]);
      expect(bundle.state.description).to.eql('Tests');
    });

    it('TestSuite {objects}', async () => {
      const root1 = Test.describe('1', (e) => e.it('1.1'));
      const root2 = Test.describe('2', (e) => e.it('2.1'));

      const bundle = await Test.bundle([root1, root2]);

      const children = bundle.state.children;
      const test1 = children[0].state.tests[0];
      const test2 = children[1].state.tests[0];

      expect(children.length).to.eql(2);
      expect(children[0].state.description).to.eql(root1.state.description);
      expect(children[1].state.description).to.eql(root2.state.description);

      expect(children[0].state.parent?.id).to.eql(bundle.id);
      expect(children[1].state.parent?.id).to.eql(bundle.id);

      expect(TestTree.root(test1)).to.equal(bundle);
      expect(TestTree.root(test2)).to.equal(bundle);
    });

    it('dynamic imports("...")', async () => {
      const root1 = import('./test.samples/One.TEST');
      const root2 = import('./test.samples/Two.TEST');

      const bundle = await Test.bundle([root1, root2]);

      const children = bundle.state.children;
      const test1 = children[0].state.tests[0];
      const test2 = children[1].state.tests[0];

      expect(children.length).to.eql(2);
      expect(children[0].state.description).to.eql('One');
      expect(children[1].state.description).to.eql('Two');

      expect(children[0].state.parent?.id).to.eql(bundle.id);
      expect(children[0].state.parent?.id).to.eql(bundle.id);

      expect(TestTree.root(test1)).to.equal(bundle);
      expect(TestTree.root(test2)).to.equal(bundle);
    });

    it('dynamic: with no export (ignore)', async () => {
      const bundle1 = await Test.bundle([import('./test.samples/NoExport.TEST')]);
      expect(bundle1.state.children).to.eql([]);

      const bundle2 = await Test.bundle([
        import('./test.samples/NoExport.TEST'), // NB: Will not merge anything (no default export)
        import('./test.samples/One.TEST'),
        import('./test.samples/Two.TEST'),
      ]);
      const children = bundle2.state.children;
      expect(children.length).to.eql(2);
      expect(children[0].state.description).to.eql('One');
      expect(children[1].state.description).to.eql('Two');
    });

    it('dynamic: default export not a test-suite (ignore)', async () => {
      const bundle = await Test.bundle([import('./test.samples/ExportNonSuite.TEST')]);
      expect(bundle.state.children).to.eql([]);
    });

    it('mixed import (dynamic/static) with explicit root "description"', async () => {
      const root1 = Test.describe('One');
      const root2 = import('./test.samples/Two.TEST');

      const bundle = await Test.bundle('MySuite', [root1, root2]);
      const children = bundle.state.children;

      expect(bundle.state.description).to.eql('MySuite');
      expect(children.length).to.eql(2);
      expect(children[0].state.description).to.eql('One');
      expect(children[1].state.description).to.eql('Two');
    });

    it('single item bundle (no array)', async () => {
      const root1 = Test.describe('One');
      const root2 = import('./test.samples/Two.TEST');

      const bundle1 = await Test.bundle(root1);
      const bundle2 = await Test.bundle(root2);
      const bundle3 = await Test.bundle('MySuite-1', root1);
      const bundle4 = await Test.bundle('MySuite-2', root2);

      expect(bundle1.state.description).to.eql(root1.state.description); // NB: Root name taken from single bundle.
      expect(bundle2.state.description).to.eql((await root2).default.state.description); // NB: Root name taken from single bundle.
      expect(bundle3.state.description).to.eql('MySuite-1'); // NB: Custom name.
      expect(bundle4.state.description).to.eql('MySuite-2');
    });
  });

  describe('Test.run', () => {
    it('nothing [<empty>]', async () => {
      const res = await Test.run([]);
      expect(res.ok).to.eql(true);
      expect(res.description).to.eql('Tests');
      expect(res.tests).to.eql([]);
      expect(res.children).to.eql([]);
    });

    it('TestSuite {objects}', async () => {
      const root1 = Test.describe('1', (e) => e.it('1.1'));
      const root2 = Test.describe('2', (e) => e.it('2.1'));

      const test = async (res: t.TestSuiteRunResponse) => {
        expect(res.ok).to.eql(true);
        expect(res.description).to.eql('Tests');
        expect(res.tests).to.eql([]);
        expect(res.children.length).to.eql(2);
        expect(res.children[0].tests[0].description).to.eql('1.1');
        expect(res.children[1].tests[0].description).to.eql('2.1');
      };

      await test(await Test.run([root1, root2]));
      await test(await Test.run(await Test.bundle([root1, root2])));
    });

    it('dynamic imports("...")', async () => {
      const root1 = import('./test.samples/One.TEST');
      const root2 = import('./test.samples/Two.TEST');

      const res = await Test.run([root1, root2]);
      expect(res.ok).to.eql(true);
      expect(res.description).to.eql('Tests');

      expect(res.children[0].tests[0].description).to.eql('one.foo');
      expect(res.children[1].tests[0].description).to.eql('two.foo');
    });

    it('mixed import (dynamic/static) with explicit root "description"', async () => {
      const root1 = Test.describe('One');
      const root2 = import('./test.samples/Two.TEST');

      const res = await Test.run('MySuite', [root1, root2]);
      expect(res.ok).to.eql(true);
      expect(res.description).to.eql('MySuite');

      expect(res.children[0].description).to.eql('One');
      expect(res.children[1].description).to.eql('Two');

      expect(res.children[0].tests).to.eql([]);
      expect(res.children[1].tests[0].description).to.eql('two.foo');
    });
  });
});
