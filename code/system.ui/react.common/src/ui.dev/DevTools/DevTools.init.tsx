import { Lorem } from '../../ui.tools';
import { DevBase, Spec, t } from '../common';
import { boolean } from '../DevTools.Boolean';
import { button } from '../DevTools.Button';
import { hr } from '../DevTools.Hr';
import { title } from '../DevTools.Title';
import { todo } from '../DevTools.Todo';
import { textbox } from '../DevTools.Textbox';
import { Helpers } from './Helpers.mjs';

type O = Record<string, unknown>;

/**
 * Initializes a DevTools instance with the given
 * context ({ctx}) curried within the closure.
 */
export function init<S extends O = O>(input: t.DevCtxInput, initialState?: S) {
  const initial = initialState ?? ({} as S);
  const ctx = Spec.ctx(input);
  const debug = ctx.debug;
  const events = DevBase.Bus.events(input);
  let _state: t.DevCtxState<S> | undefined;

  const api: t.DevTools<S> = {
    ctx,
    header: debug.header,
    footer: debug.footer,
    row: debug.row,

    redraw(target) {
      return ctx.redraw(target);
    },

    /**
     * Helpers
     */
    section(...args: any[]) {
      if (typeof args[0] === 'string') {
        api.title(args[0]);
        if (typeof args[1] === 'function') {
          api.section(args[1]);
        } else {
          api.TODO(`"${args[0] ?? 'Unnamed'}" section`);
        }
      }
      if (typeof args[0] === 'function') {
        args[0](api);
      }
      return api;
    },

    async state() {
      return _state || (_state = await ctx.state(initial));
    },

    async change(fn) {
      const state = await api.state();
      return state.change(fn);
    },

    lorem(words, endWith) {
      return Lorem.words(words, endWith);
    },

    theme(value) {
      Helpers.theme(ctx, value);
      return api;
    },

    /**
     * 🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
     *
     *  Widget: Argument wrangling methods.
     *
     * 🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
     */

    /**
     * Title text.
     */
    title(...args: any[]) {
      if (typeof args[0] === 'string') {
        api.title((title) => title.text(args[0]).style(args[1]));
      }
      if (typeof args[0] === 'function') {
        title<S>(events, ctx, initial, args[0]);
      }
      return api;
    },

    /**
     * Simple button.
     */
    button(...args: any[]) {
      if (typeof args[0] === 'string') {
        api.button((btn) => btn.label(args[0]).onClick(args[1]));
      }
      if (typeof args[0] === 'function') {
        button<S>(events, ctx, initial, args[0]);
      }
      return api;
    },

    /**
     * Boolean switch button.
     */
    boolean(...args: any[]) {
      if (typeof args[0] === 'function') {
        boolean<S>(events, ctx, initial, args[0]);
      }
      return api;
    },

    /**
     * Input Textbox
     */
    textbox(...args: any[]) {
      if (typeof args[0] === 'function') {
        textbox<S>(events, ctx, initial, args[0]);
      }
      return api;
    },

    /**
     * Task marker ("todo")
     */
    TODO(...args: any[]) {
      if (args.length === 0) {
        return api.TODO('');
      }
      if (typeof args[0] === 'string') {
        api.TODO((title) => title.text(args[0]).style(args[1]));
      }
      if (typeof args[0] === 'function') {
        todo<S>(events, ctx, initial, args[0]);
      }
      return api;
    },

    /**
     * Horizontal-rule (visual divider).
     */
    hr(...args: any[]) {
      if (args.length === 0) {
        return api.hr(() => null);
      }
      if (typeof args[0] === 'number' || Array.isArray(args[0])) {
        const line = Array.isArray(args[0]) ? args[0] : [args[0]];
        const margin = args[1];
        const color = args[2];
        return api.hr((hr) => hr.thickness(line[0]).opacity(line[1]).margin(margin).color(color));
      }
      if (typeof args[0] === 'function') {
        hr<S>(events, ctx, initial, args[0]);
      }
      return api;
    },
  };

  return api;
}
