import { type t } from '../common';
import type { HTMLAttributeReferrerPolicy } from 'react';

type HttpPermissionsPolicy = string; // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy
type UrlString = string;
type Src = { html?: string; url?: UrlString };

/**
 * Applies extra restrictions to the content in the frame.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox
 */
export type IFrameSandbox =
  | 'allow-downloads-without-user-activation'
  | 'allow-downloads'
  | 'allow-forms'
  | 'allow-modals'
  | 'allow-orientation-lock'
  | 'allow-pointer-lock'
  | 'allow-popups'
  | 'allow-popups-to-escape-sandbox'
  | 'allow-presentation'
  | 'allow-same-origin'
  | 'allow-scripts'
  | 'allow-storage-access-by-user-activation'
  | 'allow-top-navigation'
  | 'allow-top-navigation-by-user-activation';

export type IFrameLoading = 'eager' | 'lazy';

/**
 * Component
 */

export type IFrameLoadedEventHandler = (e: IFrameLoadedEventHandlerArgs) => void;
export type IFrameLoadedEventHandlerArgs = {
  href: string;
};

export type IFrameProps = {
  src?: UrlString | Src;
  width?: string | number;
  height?: string | number;
  title?: string;
  name?: string;
  sandbox?: true | t.IFrameSandbox[];
  allow?: HttpPermissionsPolicy;
  allowFullScreen?: boolean;
  referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
  loading?: t.IFrameLoading;
  style?: t.CssValue;
  onLoad?: IFrameLoadedEventHandler;
};
