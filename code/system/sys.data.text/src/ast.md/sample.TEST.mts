import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { selectAll } from 'unist-util-select';
import { SKIP, visit } from 'unist-util-visit';
import { visitParents } from 'unist-util-visit-parents';

import { describe, expect, it } from '../test/index.mjs';

import type { Root } from 'mdast';
import type { Parent, Node, Data } from 'unist';

describe('Sample: markdown with "universal syntax tree" utilities (unist)', () => {
  describe('unist-util ', () => {
    /**
     * https://unifiedjs.com/learn/recipe/tree-traversal-typescript/#unist-util-visit
     */
    describe('unist-util-visit', () => {
      it('sample: increase markdown heading level', async () => {
        function samplePlugin() {
          return (tree: Root) => {
            visit(tree, 'heading', (node) => {
              node.depth += 1;
            });
          };
        }

        const pipeline = unified()
          //
          .use(remarkParse)
          .use(samplePlugin)
          .use(remarkStringify);

        const res = await pipeline.process(`# Hello`);
        expect(res.toString()).to.eql(`## Hello\n`);
      });

      it('sample: make all ordered lists in a markdown document unordered', async () => {
        function samplePlugin() {
          return (tree: Root) => {
            visit(tree, 'list', (node) => {
              if (node.ordered) node.ordered = false;
            });
          };
        }

        const pipeline = unified()
          //
          .use(remarkParse)
          .use(samplePlugin)
          .use(remarkStringify);

        const res = await pipeline.process(`1. Hello`);
        expect(res.toString()).to.eql(`*   Hello\n`);
      });
    });

    /**
     * https://unifiedjs.com/learn/recipe/tree-traversal-typescript/#unist-util-visit-parents
     */
    describe('unist-util-visit-parents', () => {
      it('check if all markdown [ListItem] are inside a [List]', async () => {
        const _parents: Parent[] = [];

        function samplePlugin() {
          return (tree: Root) => {
            visitParents(tree, 'listItem', (listItem, parents) => {
              _parents.push(...parents);
            });
          };
        }

        const pipeline = unified()
          //
          .use(remarkParse)
          .use(samplePlugin)
          .use(remarkStringify);

        const res = await pipeline.process(`1. Hello`);
        expect(res.toString()).to.eql('1.  Hello\n');

        expect(_parents.length).to.eql(2);
        expect(_parents[0].type).to.eql('root');
        expect(_parents[1].type).to.eql('list');
      });
    });

    /**
     * https://unifiedjs.com/learn/recipe/tree-traversal-typescript/#unist-util-select
     */
    describe('unist-util-select', () => {
      it('select a node', async () => {
        const _matches: Node<Data>[] = [];

        function samplePlugin() {
          return (tree: Root) => {
            const matches = selectAll('blockquote paragraph', tree);
            _matches.push(...matches);
          };
        }

        const pipeline = unified()
          //
          .use(remarkParse)
          .use(samplePlugin)
          .use(remarkStringify);

        const res = await pipeline.process(`>> Hello`);
        expect(res.toString()).to.eql('> > Hello\n');

        expect(_matches.length).to.eql(1);
        expect(_matches[0].type).to.eql('paragraph');
      });
    });
  });

  describe('partial processing and combining', () => {
    it('combine', async () => {
      //
    });
  });
});
  