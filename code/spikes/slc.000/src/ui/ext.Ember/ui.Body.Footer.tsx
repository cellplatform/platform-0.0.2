import { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, DEFAULTS, FC, rx, type t } from './common';
import { ConceptPlayer } from '../ui.Concept.Player';

export type FooterProps = {
  vimeo?: t.VimeoInstance;
  slug?: t.ConceptSlug;
  style?: t.CssValue;
  onPlayComplete?: t.ConceptPlayerCompleteHandler;
};

export const Footer: React.FC<FooterProps> = (props) => {
  const { vimeo, slug } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      paddingTop: 5,
      paddingBottom: 10,
      PaddingX: 8,
      display: 'grid',
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <ConceptPlayer vimeo={vimeo} slug={slug} onComplete={props.onPlayComplete} />
    </div>
  );
};
