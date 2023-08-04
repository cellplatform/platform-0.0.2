import { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, DEFAULTS, FC, rx, type t } from './common';

const View: React.FC<t.VideoDiagramLayoutProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      padding: 5,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div>{`🐷 ${VideoDiagramLayout.displayName}`}</div>
    </div>
  );
};

/**
 * Export
 */
type Fields = {
  DEFAULTS: typeof DEFAULTS;
};
export const VideoDiagramLayout = FC.decorate<t.VideoDiagramLayoutProps, Fields>(
  View,
  { DEFAULTS },
  { displayName: 'VideoDiagramLayout' },
);
