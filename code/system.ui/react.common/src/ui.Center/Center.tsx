import type React from 'react';

import { css, t } from '../common';

export type CenterProps = {
  flex?: number;
  children?: JSX.Element;
  style?: t.CssValue;
};

/**
 * Horizontal and verical alignmnet of children.
 */
export const Center: React.FC<CenterProps> = (props) => {
  const { flex } = props;

  const styles = {
    base: css({
      flex,
      position: 'relative',
      display: 'grid',
      justifyContent: 'center',
      alignContent: 'center',
    }),
  };
  return <div {...css(styles.base, props.style)}>{props.children}</div>;
};
