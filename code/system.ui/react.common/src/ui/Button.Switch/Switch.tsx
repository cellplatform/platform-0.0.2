import { useEffect, useState } from 'react';

import { css, FC, t } from '../common';
import { SwitchThumb } from './Switch.Thumb';
import { SwitchTrack } from './Switch.Track';
import { SwitchTheme } from './theme.mjs';

export type SwitchProps = {
  value?: boolean;
  width?: number;
  height?: number;
  isEnabled?: boolean;
  tooltip?: string;
  track?: Partial<t.SwitchTrack>;
  thumb?: Partial<t.SwitchThumb>;
  theme?: t.SwitchThemeName | Partial<t.SwitchTheme>;
  transitionSpeed?: number;
  style?: t.CssValue;

  onClick?: React.MouseEventHandler;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
};

const View: React.FC<SwitchProps> = (props) => {
  const { track = {}, thumb = {} } = props;
  const theme = toTheme(props.theme);
  const height = props.height ?? 32;
  const width = props.width ?? height * 2 - height * 0.4;
  const transitionSpeed = props.transitionSpeed ?? 200;
  const isEnabled = props.isEnabled ?? true;
  const value = Boolean(props.value);

  const [isDown, setIsDown] = useState<boolean>(false);
  const [isOver, setIsOver] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const args = {
    isLoaded,
    isEnabled,
    value,
    theme,
    width,
    height,
    transitionSpeed,
  };

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      width,
      height,
      opacity: isEnabled ? 1 : theme.disabledOpacity,
    }),
  };

  const handleOnClick = (e: React.MouseEvent) => {
    if (e.button === 0 && props.onClick) {
      props.onClick(e);
    }
  };

  const overHandler = (isOver: boolean): React.MouseEventHandler => {
    return (e) => {
      setIsOver(isOver);
      if (!isOver && isDown) setIsDown(false);
      if (isEnabled) {
        if (isOver && props.onMouseEnter) props.onMouseEnter(e);
        if (!isOver && props.onMouseLeave) props.onMouseLeave(e);
      }
    };
  };

  const downHandler = (isDown: boolean): React.MouseEventHandler => {
    return (e) => {
      setIsDown(isDown);
      if (isEnabled) {
        if (isDown && props.onMouseDown) props.onMouseDown(e);
        if (!isDown && props.onMouseUp) props.onMouseUp(e);
        if (!isDown && props.onClick) handleOnClick(e);
      }
    };
  };

  return (
    <div
      {...css(styles.base, props.style)}
      title={props.tooltip}
      onMouseEnter={overHandler(true)}
      onMouseLeave={overHandler(false)}
      onMouseDown={downHandler(true)}
      onMouseUp={downHandler(false)}
    >
      <SwitchTrack track={track} switch={args} />
      <SwitchThumb thumb={thumb} switch={args} />
    </div>
  );
};

/**
 * [Helpers]
 */

function toTheme(input?: t.SwitchThemeName | Partial<t.SwitchTheme>): t.SwitchTheme {
  let theme = input || 'LIGHT';
  theme =
    typeof theme === 'string' ? SwitchTheme.fromString(theme as t.SwitchThemeName).green : theme;
  return theme as t.SwitchTheme;
}

/**
 * [Export]
 */

type Fields = {
  Theme: typeof SwitchTheme;
};
export const Switch = FC.decorate<SwitchProps, Fields>(
  View,
  { Theme: SwitchTheme },
  { displayName: 'Switch' },
);
