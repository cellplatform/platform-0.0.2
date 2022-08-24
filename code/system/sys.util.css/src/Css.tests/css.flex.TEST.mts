import { expect } from '../TEST/index.mjs';
import { Style } from '../index.mjs';

describe('Flex', () => {
  it('does not fail when undefined is passed', () => {
    const result = Style.transform({ Flex: undefined });
    expect(result).to.eql({});
  });

  it('does not fail when false is passed', () => {
    const result = Style.transform({ Flex: false });
    expect(result).to.eql({});
  });
});
