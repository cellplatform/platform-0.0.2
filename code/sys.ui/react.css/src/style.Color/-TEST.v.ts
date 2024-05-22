import { Color } from '.';
import { describe, expect, it } from '../test';

describe('color', () => {
  describe('Color.format', () => {
    const test = (value: string | number | boolean | undefined, output: string | undefined) => {
      expect(Color.format(value)).to.eql(output);
    };

    it('converts number to RGBA', () => {
      test(0, 'rgba(0, 0, 0, 0.0)');
      test(1, 'rgba(255, 255, 255, 1)');
      test(0.5, 'rgba(255, 255, 255, 0.5)');
      test(-1, 'rgba(0, 0, 0, 1)');
      test(-0.5, 'rgba(0, 0, 0, 0.5)');
    });

    it('converts TRUE to RED (ruby)', () => {
      test(true, Color.RED);
    });

    it('undefined', () => {
      test(undefined, undefined);
    });

    it('string: RGB value', () => {
      const rgb = 'rgb(0, 245, 35)';
      test(rgb, rgb);
    });

    it('string: RGBA value', () => {
      const rgb = 'rgba(0, 245, 35, 0.7)';
      test(rgb, rgb);
    });

    it('string: hex value', () => {
      const hex = '#fff';
      test(hex, hex);
    });

    it('string: hex value with no hash', () => {
      test('fff', '#fff');
    });

    it('string: does not convert "url(...)"', () => {
      const value = `url(my-image.png)`;
      test(value, value);
    });
  });

  describe('Color.debug', () => {
    it('debugging: true', () => {
      const debugColor = Color.debug(true);
      expect(debugColor()).to.eql('rgba(255, 0, 0, 0.3)');
      expect(debugColor(0.3)).to.eql('rgba(255, 0, 0, 0.3)');
    });

    it('not debugging: false', () => {
      const debugColor = Color.debug(false);
      expect(debugColor(0.3)).to.eql(undefined);
    });

    it('not debugging: (undefined)', () => {
      const debugColor = Color.debug();
      expect(debugColor(0.3)).to.eql(undefined);
    });
  });

  describe('Color.alpha', () => {
    it('DARK', () => {
      const res = Color.alpha(Color.DARK, 0.3);
      expect(res).to.eql('rgba(41, 48, 66, 0.3)');
    });

    it('WHITE', () => {
      const res1 = Color.alpha(Color.WHITE, 0.5);
      const res2 = Color.alpha('white', 0.5);
      const res3 = Color.alpha('#fff', 0.5);
      expect(res1).to.eql('rgba(255, 255, 255, 0.5)');
      expect(res2).to.eql('rgba(255, 255, 255, 0.5)');
      expect(res3).to.eql('rgba(255, 255, 255, 0.5)');
    });
  });

  describe('Color.theme', () => {
    it('name: Light (default)', () => {
      const res1 = Color.theme();
      const res2 = Color.theme('Light');
      const res3 = Color.theme('Light', 'red', 'salmon');
      expect(res1.name).to.eql('Light');
      expect(res1.is.light).to.eql(true);
      expect(res1.is.dark).to.eql(false);
      expect(res1.fg).to.eql(Color.DARK);
      expect(res1.bg).to.eql(Color.WHITE);
      expect(res2.fg).to.eql(Color.DARK);
      expect(res2.bg).to.eql(Color.WHITE);
      expect(res3.fg).to.eql('red');
      expect(res3.bg).to.eql('salmon');
    });

    it('name: Dark', () => {
      const res1 = Color.theme('Dark');
      const res2 = Color.theme('Dark', null, 'red');
      expect(res1.name).to.eql('Dark');
      expect(res1.is.light).to.eql(false);
      expect(res1.is.dark).to.eql(true);
      expect(res1.fg).to.eql(Color.WHITE);
      expect(res2.fg).to.eql('red');
      expect(res1.bg).to.eql(Color.DARK);
      expect(res2.bg).to.eql(Color.DARK);
    });

    it('input: {theme} object', () => {
      const theme = Color.theme();
      expect(Color.theme(undefined).name).to.eql('Light');
      expect(Color.theme(null).name).to.eql('Light');
      expect(Color.theme(theme)).to.equal(theme);
      expect(Color.theme('Light').name).to.eql('Light');
      expect(Color.theme('Dark').name).to.eql('Dark');
    });

    it('alpha.fg (foreground)', () => {
      const light = Color.theme();
      const dark = Color.theme('Dark');

      const res1 = light.alpha().fg;
      const res2 = light.alpha(0.5).fg;
      const res3 = dark.alpha(0.3).fg;

      expect(res1).to.eql('rgb(41, 48, 66)');
      expect(res2).to.eql('rgba(41, 48, 66, 0.5)');
      expect(res3).to.eql('rgba(255, 255, 255, 0.3)');
    });

    it('alpha.bg (background)', () => {
      const light = Color.theme();
      const dark = Color.theme('Dark');

      const res1 = light.alpha().bg;
      const res2 = light.alpha(0.5).bg;
      const res3 = dark.alpha(0.3).bg;

      expect(res1).to.eql('rgb(255, 255, 255)');
      expect(res2).to.eql('rgba(255, 255, 255, 0.5)');
      expect(res3).to.eql('rgba(41, 48, 66, 0.3)');
    });

    it('invert', () => {
      const light = Color.theme();
      const dark = Color.theme('Dark');

      expect(light.invert().name).to.eql('Dark');
      expect(dark.invert().name).to.eql('Light');

      expect(light.invert()).to.not.equal(light); // NB: monad.
    });

    it('invert: custom colors', () => {
      const theme = Color.theme('Light', 'red', 'salmon');
      const inverted = theme.invert();

      expect(theme.fg).to.eql('red');
      expect(theme.bg).to.eql('salmon');

      expect(inverted.fg).to.eql('salmon');
      expect(inverted.bg).to.eql('red');
    });
  });
});
