import { Test } from '.';
import { describe, expect, it, t, Time } from '../test';
import { TestTree } from '../TestSuite.helpers';

describe('TestSuiteModel', () => {
  describe('model', () => {
    it('id: "TestSuite.<slug>"', () => {
      const model1 = Test.describe('foo');
      const model2 = Test.describe('foo');

      expect(model1.id.startsWith('TestSuite.')).to.eql(true);
      expect(model2.id.startsWith('TestSuite.')).to.eql(true);

      expect(model1.kind).to.eql('TestSuite');
      expect(model2.kind).to.eql('TestSuite');

      expect(model1).to.not.equal(model2); // NB: Different instance.
    });

    it('empty (no handler)', () => {
      const root = Test.describe('root');
      expect(root.ready).to.eql(false);
      expect(root.state.ready).to.eql(false);
      expect(root.state.description).to.eql('root');
      expect(root.state.children).to.eql([]);
      expect(root.state.tests).to.eql([]);
      expect(root.state.modifier).to.eql(undefined);
    });

    it('handler (not initialized)', () => {
      const handler: t.TestSuiteHandler = (e) => null;
      const root = Test.describe('root', handler);
      expect(root.ready).to.eql(false);
    });

    it('timeout', async () => {
      const children: t.TestSuiteModel[] = [];

      const root1 = Test.describe('root-1', (e) => {
        const root2 = e.describe('root-2', (e) => {
          e.timeout(-99);
          const root3 = e.describe('root-3', (e) => {
            e.timeout(0).timeout(5000);
          });
          children.push(root3);
        });
        children.push(root2);
      });

      // Default (not initialized yet).
      expect(root1.state.timeout).to.eql(undefined);
      await root1.init();
      const root2 = children[0];
      const root3 = children[1];

      expect(root1.state.timeout).to.eql(undefined);
      expect(root2.state.timeout).to.eql(0); // NB: clamped.
      expect(root3.state.timeout).to.eql(5000);
    });

    it('init (single test)', async () => {
      let test: t.TestModel | undefined = undefined;
      let count = 0;
      const handler: t.TestHandler = () => null;

      const root = Test.describe('root', (e) => {
        count++;
        test = e.it('foo', handler);
      });

      expect(root.ready).to.eql(false);
      expect(root.state.ready).to.eql(false);
      expect(root.description).to.eql('root');
      expect(root.state.description).to.eql('root');
      expect(count).to.eql(0);

      const res1 = await root.init();
      expect(res1).to.equal(root);
      expect(root.ready).to.eql(true);
      expect(root.state.ready).to.eql(true);
      expect(count).to.eql(1);

      // NB: multiple calls only initialize once.
      const res2 = await res1.init();
      expect(count).to.eql(1);
      expect(res2).to.equal(root);
      expect(root.state.ready).to.eql(true);
      expect(root.state.tests).to.eql([test]);
      expect(root.state.children).to.eql([]);
    });

    it('parent refs', async () => {
      const root = Test.describe('root', (e) => {
        e.describe('child-1', (e) => {
          e.describe('child-2');
        });
      });

      await root.init();
      const child1 = root.state.children[0];
      const child2 = child1.state.children[0];

      expect(root.state.parent).to.equal(undefined);
      expect(child1.state.parent).to.equal(root);
      expect(child2.state.parent).to.equal(child1);
    });

    it('init (async suite setup)', async () => {
      let count = 0;
      const root = Test.describe('root', async (e) => {
        await Time.wait(10);
        e.describe('child', async () => {
          await Time.wait(10);
          count++;
        });
        count++;
      });

      expect(count).to.eql(0);
      await root.init();
      expect(count).to.eql(2);
    });

    it('child suite (deep)', async () => {
      const children: t.TestSuiteModel[] = [];

      const root = Test.describe('root', (e) => {
        const child1 = e.describe('child-1', (e) => {
          const child2 = e.describe('child-2');
          children.push(child2);
        });
        children.push(child1);
      });

      expect(root.state.children).to.eql([]);
      expect(children).to.eql([]);

      await root.init();

      const child1 = children[0];
      const child2 = children[1];

      expect(root.state.ready).to.eql(true);
      expect(root.state.children).to.eql([child1]);

      expect(child1.state.ready).to.eql(true);
      expect(child2.state.ready).to.eql(true);
    });

    it('define: it.skip | it.only', async () => {
      const root = Test.describe('root', (e) => {
        e.it('foo-1');
        e.it.skip('foo-2');
        e.describe('child', (e) => {
          e.it.only('bar');
        });
      });

      await root.init();
      const state = root.state;

      expect(state.tests[0].description).to.eql('foo-1');
      expect(state.tests[1].description).to.eql('foo-2');

      expect(state.tests[0].modifier).to.eql(undefined);
      expect(state.tests[1].modifier).to.eql('skip');

      const child = state.children[0].state;
      expect(child.tests[0].description).to.eql('bar');
      expect(child.tests[0].modifier).to.eql('only');
    });

    it('define: describe.skip | describe.only', async () => {
      const root = Test.describe('root', (e) => {
        e.describe.skip('child-1');
        e.describe.only('child-2');
        e.describe.skip('child-3', (e) => {
          e.it('foo', (e) => {});
        });
      });

      await root.init();

      expect(root.state.modifier).to.eql(undefined);
      expect(root.state.children[0].state.modifier).to.eql('skip');
      expect(root.state.children[1].state.modifier).to.eql('only');
      expect(root.state.children[2].state.modifier).to.eql('skip');
    });

    it('define (root): Test.describe.skip | Test.describe.only', async () => {
      const root1 = Test.describe('root');
      const root2 = Test.describe.skip('root');
      const root3 = Test.describe.only('root');

      await root1.init();
      await root2.init();
      await root3.init();

      expect(root1.state.modifier).to.eql(undefined);
      expect(root2.state.modifier).to.eql('skip');
      expect(root3.state.modifier).to.eql('only');
    });

    it('clone', async () => {
      const root1 = Test.describe('root', (e) => {
        e.describe('child-1', (e) => {
          e.it('hello', () => null);
        });
      });

      const root2 = await root1.clone();
      await root1.init();

      const child1 = root1.state.children[0];
      const child2 = root2.state.children[0];

      const test1 = child1.state.tests[0];
      const test2 = child2.state.tests[0];

      // Different instances.
      expect(root1).to.not.equal(root2);
      expect(root1.state).to.not.equal(root2.state);
      expect(root1.state.children[0]).to.not.equal(root2.state.children[0]);
      expect(test1).to.not.equal(test2);

      // Equivalent objects.
      expect(root1.state.description).to.eql(root2.state.description);
      expect(child1.state.description).to.eql(child2.state.description);
      expect(test1.description).to.eql(test2.description);

      // Different ID's.
      expect(root1.id).to.not.eql(root2.id);
      expect(root1.state.children[0].id).to.not.eql(root2.state.children[0].id);

      // Parent hierarchy correctly re-referenced to the clone.
      expect(TestTree.root(test1)).to.equal(root1);
      expect(TestTree.root(test2)).to.equal(root2);
    });

    it('walk (down)', async () => {
      const root = await Test.describe('root', (e) => {
        e.describe('child-1', (e) => {
          e.describe('child-2', (e) => {
            e.it('foo', (e) => {
              expect(123).to.eql(123);
            });
          });
        });
      }).init();

      const walked: string[] = [];
      root.walk((e) => {
        const suite = e.suite.description;
        const v = e.test ? `${suite} > ${e.test.description}` : suite;
        walked.push(v);
      });

      expect(walked).to.eql(['root', 'child-1', 'child-2', 'child-2 > foo']);
    });
  });

  describe('hash', async () => {
    const model1 = await Test.describe('foo').init();
    const model2 = await Test.describe('foo', (e) => {
      e.it('bar', () => null);
      e.describe('child', (e) => {
        e.it('baz', () => null);
        e.it('boo', () => null);
      });
    }).init();

    it('hash: SHA1 (default)', async () => {
      const hash1 = model1.hash();
      const hash2 = model2.hash();
      const hash3 = model2.hash();

      expect(hash1).to.not.eql(hash2);
      expect(hash2).to.eql(hash3);
      expect(hash1).to.match(/^suite\:sha1-/);
    });

    it('hash: SHA256', async () => {
      const hash1 = model1.hash('SHA1');
      const hash2 = model1.hash('SHA256');
      expect(hash2).to.match(/^suite\:sha256-/);
      expect(hash2.length).to.greaterThan(hash1.length);
    });

    it('hash: not initialized', async () => {
      const model = Test.describe('foo', (e) => {
        e.it('bar', () => null);
      });

      const hash1 = model.hash();
      await model.init();
      const hash2 = model.hash();

      expect(hash1).to.not.eql(hash2);
      expect(hash1).to.match(/^suite\:sha1-/);
      expect(hash2).to.match(/^suite\:sha1-/);
    });
  });

  describe('merge', () => {
    it('merges multiple specs together into single root', async () => {
      const root = Test.describe('root');
      const child1 = Test.describe('child-1');
      const child2 = Test.describe('child-2');
      const child3 = Test.describe('child-3');

      expect(root.state.children).to.eql([]);

      await root.merge(child1);
      expect(root.state.children.length).to.eql(1);
      expect(root.state.children[0].state.description).to.eql(child1.state.description);

      await root.merge(child2, child3);
      expect(root.state.children.length).to.eql(3);

      expect(root.state.children[0].state.description).to.eql(child1.state.description);
      expect(root.state.children[1].state.description).to.eql(child2.state.description);
      expect(root.state.children[2].state.description).to.eql(child3.state.description);

      expect(root.state.children[0].state.parent?.id).to.eql(root.id);
      expect(root.state.children[1].state.parent?.id).to.eql(root.id);
      expect(root.state.children[2].state.parent?.id).to.eql(root.id);

      // Not the same instance (cloned).
      expect(root.state.children[0]).to.not.equal(child1);
      expect(root.state.children[1]).to.not.equal(child2);
      expect(root.state.children[2]).to.not.equal(child3);

      expect(TestTree.root(root.state.children[0])).to.equal(root);
      expect(TestTree.root(root.state.children[1])).to.equal(root);
      expect(TestTree.root(root.state.children[2])).to.equal(root);
    });
  });

  describe('run', () => {
    it('sync', async () => {
      let count = 0;
      const root = Test.describe('root', (e) => {
        e.it('foo', () => count++);
      });
      const res = await root.run();

      expect(res.id).to.eql(root.id);
      expect(res.ok).to.eql(true);
      expect(count).to.eql(1);
      expect(res.noop).to.eql(undefined);
    });

    it('async', async () => {
      let count = 0;
      const root = Test.describe('root', (e) => {
        e.it('foo', async () => {
          await Time.wait(20);
          count++;
        });
      });
      const res = await root.run();

      expect(res.id).to.eql(root.id);
      expect(count).to.eql(1);
      expect(res.ok).to.eql(true);
      expect(res.elapsed).to.greaterThan(18);
    });

    it('{ beforeEach, afterEach } parameter', async () => {
      const root = Test.describe('root', (e) => {
        e.it('foo', (e) => {});
        e.it('bar', async (e) => {
          await Time.wait(5);
        });
      });

      const beforeEach: t.BeforeRunTestArgs[] = [];
      const afterEach: t.AfterRunTestArgs[] = [];
      await root.run({
        beforeEach: (e) => beforeEach.push(e),
        afterEach: (e) => afterEach.push(e),
      });

      const test1 = root.state.tests[0];
      const test2 = root.state.tests[1];

      expect(beforeEach.length).to.eql(2);
      expect(beforeEach[0].description).to.eql('foo');
      expect(beforeEach[1].description).to.eql('bar');
      expect(beforeEach[0].id).to.eql(test1.id);
      expect(beforeEach[1].id).to.eql(test2.id);

      expect(afterEach.length).to.eql(2);
      expect(afterEach[0].description).to.eql('foo');
      expect(afterEach[1].description).to.eql('bar');
      expect(afterEach[0].id).to.eql(test1.id);
      expect(afterEach[1].id).to.eql(test2.id);
    });

    it('run with { only } subset of IDs option', async () => {
      let _fired: string[] = [];
      const root = Test.describe('root', (e) => {
        e.it('one', () => _fired.push('one'));
        e.it('two', () => _fired.push('two'));
        e.describe('child', (e) => {
          e.it('three', () => _fired.push('three'));
        });
      });

      await root.init();

      const test1 = root.state.tests[0];
      const test2 = root.state.tests[1];
      const test3 = root.state.children[0].state.tests[0];

      const run = async (options?: t.TestSuiteRunOptions) => {
        _fired = [];
        await root.run(options);
        return _fired;
      };

      const res1 = await run();
      const res2 = await run({ only: [test2.id] });
      const res3 = await run({ only: [test3.id, test2.id] });
      const res4 = await run({ only: [] });

      expect(res1).to.eql(['one', 'two', 'three']);
      expect(res2).to.eql(['two']);
      expect(res3).to.eql(['two', 'three']);
      expect(res4).to.eql([]);
    });

    it('{ onProgress } callback', async () => {
      const root = Test.describe('root', (e) => {
        e.describe('child-1', (e) => {
          e.describe('child-2', (e) => {
            e.it('foo', () => null);
          });
        });
      });

      const res = await root.run({});
    });

    it('unique "tx" identifier for each suite run operation', async () => {
      let count = 0;
      const root = Test.describe('root', (e) => {
        e.it('foo', () => count++);
      });

      const res1 = await root.run();
      const res2 = await root.run();

      expect(res1.tx.length).to.greaterThan(0);
      expect(res1.id).to.eql(res2.id); // NB: The same suite being run.
      expect(res1.tx).to.not.eql(res2.tx); // NB: Run response ID differs.
    });

    it('with handler params: context (e.ctx)', async () => {
      const args: t.TestHandlerArgs[] = [];
      const root = Test.describe('root', (e) => {
        e.it('foo', (e) => args.push(e));
        e.describe('child', (e) => {
          e.it('bar', (e) => args.push(e));
        });
      });

      const ctx = { foo: 123 };
      await root.run(); // NB: no context.
      await root.run({ ctx });

      expect(args.length).to.eql(4); // NB: run twice
      expect(args[0].ctx).to.eql(undefined);
      expect(args[1].ctx).to.eql(undefined);
      expect(args[2].ctx).to.eql(ctx);
      expect(args[3].ctx).to.eql(ctx);
    });

    it('no tests', async () => {
      const root = Test.describe('root', (e) => null);
      const res = await root.run();
      expect(res.ok).to.eql(true);
    });

    it('deep', async () => {
      let count = 0;

      const root = Test.describe('root', (e) => {
        e.describe('child-1', (e) => {
          e.describe('child-2', (e) => {
            e.it('foo', () => count++);
          });
        });
      });

      const res = await root.run();
      expect(count).to.eql(1);
      expect(res.ok).to.eql(true);
      expect(res.tests).to.eql([]);
      expect(res.children[0].children[0].tests[0].ok).to.eql(true);
    });

    it('not deep (suppressed by param)', async () => {
      let count = 0;
      const root = Test.describe('root', (e) => {
        e.describe('child-1', (e) => {
          e.describe('child-2', (e) => {
            e.it('foo', () => count++);
          });
        });
      });

      const res = await root.run({ deep: false });
      expect(count).to.eql(0);
      expect(res.ok).to.eql(true);
    });

    it('run as no-op', async () => {
      let beforeEach = 0;
      let afterEach = 0;
      let count = 0;

      const root = Test.describe('root', (e) => {
        e.it('foo', () => count++);
        e.describe('child', (e) => {
          e.it.skip('bar', () => count++);
          e.it('baz', () => count++);
        });
      });

      const res = await root.run({
        noop: true,
        beforeEach: (e) => beforeEach++,
        afterEach: (e) => afterEach++,
      });

      expect(res.ok).to.eql(true);
      expect(res.noop).to.eql(true);
      expect(count).to.eql(0);
      expect(beforeEach).to.eql(0);
      expect(afterEach).to.eql(0);
      expect(res.stats).to.eql({ total: 3, passed: 2, failed: 0, skipped: 1, only: 0 });

      expect(res.tests[0].noop).to.eql(true);
      expect(res.children[0].noop).to.eql(true);
      expect(res.children[0].tests[0].noop).to.eql(true);
      expect(res.children[0].tests[1].noop).to.eql(true);
    });

    describe('excluded', () => {
      it('excluded: it.skip', async () => {
        let count = 0;
        const root = Test.describe('root', (e) => {
          e.it('one', () => count++);
          e.it.skip('two', () => count++);
        });

        const res = await root.run();

        expect(count).to.eql(1);
        expect(res.tests[0].excluded).to.eql(undefined);
        expect(res.tests[1].excluded).to.eql(['skip']);
      });

      it('excluded: it.only', async () => {
        const list: string[] = [];
        const root = Test.describe('root', (e) => {
          e.it('1', (e) => list.push('1'));
          e.describe('2', (e) => {
            e.it('2.1', (e) => list.push('2.1'));
            e.it.only('2.2', (e) => list.push('2.2'));
            e.it.skip('2.3', (e) => list.push('2.3'));
          });
        });

        const res = await root.run();

        expect(list).to.eql(['2.2']);
        expect(res.tests[0].excluded).to.eql(['only']);
        expect(res.children[0].tests[0].excluded).to.eql(['only']);
        expect(res.children[0].tests[1].excluded).to.eql(undefined);
        expect(res.children[0].tests[2].excluded).to.eql(['skip', 'only']);
      });

      it('excluded: describe.only', async () => {
        const list: string[] = [];
        const root = Test.describe('root', (e) => {
          e.it('1', (e) => list.push('1'));
          e.describe.only('2', (e) => {
            e.it('2.1', () => list.push('2.1'));
            e.it.skip('2.2', () => list.push('2.2'));
            e.it('2.3', () => list.push('2.3'));
          });
        });

        const res = await root.run();

        expect(list).to.eql(['2.1', '2.3']);
        expect(res.tests[0].excluded).to.eql(['only']);
        expect(res.children[0].tests[0].excluded).to.eql(undefined);
        expect(res.children[0].tests[1].excluded).to.eql(['skip', 'only']);
        expect(res.children[0].tests[2].excluded).to.eql(undefined);
      });

      it('excluded: describe.only => it.only', async () => {
        const list: string[] = [];
        const root = Test.describe('root', (e) => {
          e.it('1', () => list.push('1'));
          e.describe.only('2', (e) => {
            e.it('2.1', () => list.push('2.1'));
            e.it('2.2', () => list.push('2.2'));
            e.it.only('2.3', () => list.push('2.3'));
          });
          e.it.only('3', () => list.push('3'));
        });

        await root.run();
        expect(list).to.eql(['3', '2.3']);
      });

      it('excluded: .only within one suite of a bundled set', async () => {
        const list: string[] = [];
        const root1 = Test.describe('1', (e) => {
          e.it('1.1', (e) => list.push('1.1'));
        });
        const root2 = Test.describe('2', (e) => {
          e.it.only('2.1', (e) => list.push('2.1'));
        });

        const bundle = await Test.bundle([root1, root2]);

        const children = bundle.state.children;
        const test1 = children[0].state.tests[0];
        const test2 = children[1].state.tests[0];

        expect(TestTree.root(test1)).to.equal(bundle);
        expect(TestTree.root(test2)).to.equal(bundle);

        expect(test1).to.not.equal(root1.state.tests[0]);
        expect(test2).to.not.equal(root2.state.tests[0]);

        await bundle.run();

        expect(list).to.eql(['2.1']);
      });
    });

    describe('error', () => {
      it('error: test throws error', async () => {
        const root = Test.describe('root', (e) => {
          e.it('foo', async () => {
            throw new Error('Fail');
          });
        });
        const res = await root.run();
        expect(res.ok).to.eql(false);
        expect(res.tests[0].error?.message).to.include('Fail');
      });

      it('error: test throws error (timeout, deep)', async () => {
        let count = 0;
        const root = Test.describe('root', (e) => {
          e.it('test-1', () => count++);
          e.describe('child-1', (e) => {
            e.it('test-2', () => count++);
            e.describe('child-2', (e) => {
              e.it('test-3', async () => {
                await Time.wait(30);
                count++;
              });
            });
          });
        });

        const res = await root.run({ timeout: 10 });

        expect(res.elapsed).to.greaterThan(7);
        expect(res.elapsed).to.lessThan(50);

        expect(count).to.eql(2); // NB: failing test never increments counter.
        expect(res.ok).to.eql(false);

        expect(res.tests[0].ok).to.eql(true);
        expect(res.children[0].ok).to.eql(false);
        expect(res.children[0].tests[0].ok).to.eql(true);
        expect(res.children[0].children[0].tests[0].ok).to.eql(false);
        expect(res.children[0].children[0].tests[0].error?.message).to.include('timed out');
      });
    });
  });
});
