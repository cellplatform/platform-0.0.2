import { expect, describe, it } from '../test';
import { time } from './index.mjs';

describe('time', () => {
  it('formats date', () => {
    const d = time.day('2020-01-5');
    const f = d.format('YYYY MMM DD');
    expect(f).to.eql('2020 Jan 05');
  });

  it('timezone', () => {
    expect(time.timezone.length).to.greaterThan(1);
  });
});
