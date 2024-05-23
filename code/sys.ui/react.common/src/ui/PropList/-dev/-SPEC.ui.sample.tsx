import { PropList } from '..';
import { TextSecret } from '../../Text.Secret';
import { COLORS, DEFAULTS, Lorem, css, t } from './-common';

const HASH = 'sha256-af88c30942b2c38662619c5258ea27299fb9987c2a40fa86f58db409a58fd2b2';

const styles = {
  label: css({
    boxSizing: 'border-box',
    backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    flex: 1,
    height: 40,
    padding: 3,
    paddingLeft: 30,
    Flex: 'horizontal-end-end',
    color: COLORS.MAGENTA,
  }),
  value: css({
    backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    Flex: 'center-center',
    flex: 1,
    height: 30,
    borderRadius: 4,
  }),
  bgRed: css({
    backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
  }),
};

export const sampleItems: t.PropListItem[] = [
  { label: 'string 👋', value: 'hello 🌳' },
  { label: 'number', value: { body: 123456, clipboard: 'Value: 123456', monospace: true } },
  { label: 'boolean', value: true, selected: true },
  { label: 'boolean (switch)', value: { body: true, kind: 'Switch' } },
  { label: 'boolean (switch) - disabled', value: { body: undefined, kind: 'Switch' } },
  { label: 'clipboard function', value: { body: 'hello', clipboard: () => String(Math.random()) } },
  { label: '<Text.Syntax>', value: { body: '{object}, [1,2,3]', monospace: true } },
  {
    label: 'monospace (fontSize: 9)',
    value: { body: 'thing', clipboard: true, monospace: true, color: COLORS.CYAN, fontSize: 9 },
  },
  { label: 'color', value: { body: 'My Color', color: COLORS.MAGENTA } },
  { label: 'long (ellipsis)', value: Lorem.toString() },
  { label: 'bold', value: { body: 'value', bold: true } },
  { label: 'value opacity', value: { body: 'foobar', opacity: 0.3 } },
  {
    label: {
      body: 'click handler (label)',
      onClick(e) {
        console.info('⚡️ item.label.onClick', e);
        e.message('Label Clicked 🦄', 1200);
      },
    },
    value: 'click label',
  },
  {
    label: 'click handler (value)',
    value: {
      body: 'click value',
      onClick(e) {
        console.info('⚡️ item.value.onClick', e);
        const el = <div style={{ color: COLORS.MAGENTA }}>{'clicked element!'}</div>;
        e.message(el, 1200);
      },
    },
  },
  {
    label: 'click handler (whole)',
    value: {
      body: 'click whole item',
      onClick: (e) => console.info('⚡️ item.value.onClick', e),
    },
    onClick(e) {
      console.info('⚡️ item.onClick', e);
      e.message('My Click Message', 1200);
    },
  },
  { label: 'descender gyp', value: 'descender gyp' },
  {
    label: { body: 'no divider (toggle)', toggle: { open: true } },
    divider: false,
  },
  { label: 'one', value: '🙈', indent: 15 },
  { label: 'two', value: '🙊', indent: 15 },
  { label: 'three', value: '🙉', indent: 15 },
  { label: 'label', value: <div {...styles.value}>value</div> },
  { label: <div {...styles.label}>label</div>, value: 'value' },
  {
    label: 'component (clipboard)',
    value: {
      body: <div {...styles.value}>value</div>,
      clipboard: () => `random: ${Math.random()}`,
      onClick(e) {
        const el = <div style={{ color: COLORS.MAGENTA }}>clicked!</div>;
        e.message(el, 1200);
      },
    },
  },
  {
    label: 'div',
    value: <div {...styles.bgRed}>hello</div>,
  },
  {
    label: 'div (flex: 1)',
    value: <div {...css(styles.bgRed, { flex: 1 })}>hello</div>,
  },
  {
    label: 'token',
    value: <TextSecret text={'abcdefg123456'} fontSize={DEFAULTS.fontSize.sans} />,
  },
  { label: 'indent foo', value: 1234, indent: 15 },
  { label: 'indent bar', value: 5678, indent: 15 },
  { label: 'hash', value: { body: <PropList.Hash text={HASH} />, clipboard: HASH } },
  { value: <div {...css(styles.bgRed, { flex: 1, height: 30 })}>value only</div> },
];