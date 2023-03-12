import { RefObject, useEffect, useRef } from 'react';

import { useFocus } from '../useFocus';
import { Color, css, DEFAULTS, KeyboardMonitor, R, t } from './common';
import { TextInputRef } from './TextInput.Ref.mjs';
import { Util } from './util.mjs';

/**
 * Types
 */
export type HtmlInputProps = t.TextInputFocusAction &
  t.TextInputEventHandlers &
  t.TextInputValue & {
    inputRef: RefObject<HTMLInputElement>;
    className?: string;
    isEnabled?: boolean;
    isPassword?: boolean;
    disabledOpacity?: number;
    style?: t.CssValue;
    valueStyle?: t.TextInputStyle;
    selectionBackground?: number | string;
    spellCheck?: boolean;
    autoCapitalize?: boolean;
    autoCorrect?: boolean;
    autoComplete?: boolean;
    onDoubleClick?: React.MouseEventHandler;
  };

/**
 * Component
 */
export const HtmlInput: React.FC<HtmlInputProps> = (props) => {
  const {
    inputRef,
    value = '',
    isPassword = DEFAULTS.prop.isPassword,
    isEnabled = DEFAULTS.prop.isEnabled,
    disabledOpacity = DEFAULTS.prop.disabledOpacity,
    selectionBackground,
    maxLength,
  } = props;

  const ref = TextInputRef(inputRef);
  useFocus(inputRef, { redraw: false });

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    /**
     * NOTE:
     *    The <input> element is a "uncontrolled" component.
     *    This means that the value is not managed by React, so
     *    we update the value manually here when it changes.
     *
     * RATAIONLE:
     *    This is done do preserve the caret/selection position
     *    within the textbox when the value is changed externally
     *    via the [value] prop, which causes problems if there is
     *    an async delay between the [onChange] callback firing
     *    and the value being re-sent down to this component.
     */
    const el = inputRef.current;
    if (el) el.value = value;
  }, [value]);

  /**
   * [Handlers]
   */
  const handleChange = (e: React.ChangeEvent) => {
    const { onChanged, maxLength, mask } = props;

    // Derive values.
    const from = value;
    let to = ((e.target as any).value as string) || '';
    to = Util.value.format(to, maxLength);
    const char = Util.value.getChangedChar(from, to);
    const isMax = maxLength === undefined ? null : to.length === maxLength;

    // Check whether an input-filter will mask the value.
    if (char && mask) {
      if (!mask({ text: to, char })) return; // Handled.
    }

    // Update state and alert listeners.
    if (from !== to) {
      const modifierKeys = cloneModifierKeys();
      const selection = Wrangle.selection(inputRef.current);
      onChanged?.({ from, to, isMax, char, modifierKeys, selection });
    }
  };

  const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { onKeyDown, onEscape, onTab } = props;
    const event = toKeyboardEvent(e);

    onKeyDown?.(event);
    if (onEscape && e.key === 'Escape') onEscape(event);

    if (onTab && e.key === 'Tab') {
      let isCancelled = false;
      onTab({
        modifierKeys: cloneModifierKeys(),
        get isCancelled() {
          return isCancelled;
        },
        cancel() {
          isCancelled = true;
          e.preventDefault();
        },
      });
    }
  };

  const handleKeyup = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const event = toKeyboardEvent(e);
    if (e.key === 'Enter') props.onEnter?.(event);
    props.onKeyUp?.(event);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => props.onBlur?.(e);
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { focusAction } = props;
    if (focusAction === 'Select') ref.selectAll();
    if (focusAction === 'Cursor:Start') ref.cursorToStart();
    if (focusAction === 'Cursor:End') ref.cursorToEnd();
    props.onFocus?.(e);
  };

  /**
   * [Utility]
   */
  const toKeyboardEvent = (e: React.KeyboardEvent<HTMLInputElement>): t.TextInputKeyEvent => {
    return {
      ...e,
      modifierKeys: cloneModifierKeys(),
      preventDefault: () => e.preventDefault(),
      stopPropagation: () => e.stopPropagation(),
    };
  };

  /**
   * [Render]
   */
  const styles = {
    base: {
      position: 'relative',
      border: 'none',
      width: '100%',
      lineHeight: 0,
      outline: 'none',
      background: 'transparent',
      boxSizing: 'border-box',
      opacity: 1,
    } as t.CssValue,
  };

  if (selectionBackground) {
    styles.base = {
      ...styles.base,
      '::selection': { backgroundColor: Color.format(selectionBackground) },
    } as t.CssValue;
  }

  styles.base = R.mergeDeepRight(
    styles.base,
    Util.css.toTextInput(isEnabled, props.valueStyle ?? DEFAULTS.prop.valueStyle) as {},
  );
  styles.base = {
    ...styles.base,
    opacity: isEnabled ? 1 : disabledOpacity,
  };

  return (
    <input
      {...css(styles.base as t.CssValue, props.style)}
      className={props.className}
      ref={inputRef}
      type={isPassword ? 'password' : 'text'}
      disabled={!isEnabled}
      value={undefined} /* NB: uncontrolled, value handled above in [useEffect] */
      maxLength={maxLength}
      spellCheck={props.spellCheck}
      autoCapitalize={props.autoCapitalize === false ? 'off' : undefined}
      autoCorrect={props.autoCorrect === false ? 'off' : undefined}
      autoComplete={props.autoComplete === false ? 'off' : undefined}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeydown}
      onKeyUp={handleKeyup}
      onDoubleClick={props.onDoubleClick}
    />
  );
};

/**
 * Helpers
 */

const cloneModifierKeys = () => {
  return { ...KeyboardMonitor.state.current.modifiers };
};

const Wrangle = {
  selection(el?: HTMLInputElement | null) {
    const start = el?.selectionStart ?? -1;
    const end = el?.selectionEnd ?? -1;
    return { start, end };
  },
};
