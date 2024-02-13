import type { t } from './common';

export type ModuleLoaderTheme = 'Light' | 'Dark';

/**
 * <Component>
 */
export type ModuleLoaderProps = {
  flipped?: boolean;
  spinning?: boolean;
  spinner?: ModuleLoaderSpinner;
  theme?: ModuleLoaderTheme;
  front?: { element: t.RenderOutput };
  back?: { element: t.RenderOutput };
  style?: t.CssValue;
  onError?: ModuleLoaderErrorHandler;
};

/**
 * <Component> ← Stateful
 */
export type ModuleLoaderStatefulProps = Omit<t.ModuleLoaderProps, 'front' | 'back' | 'spinning'> & {
  name?: string;
  factory?: ModuleLoaderStatefulFactoryProp<any> | ModuleLoaderFactory<any> | null;
};
export type ModuleLoaderStatefulFactoryProp<N extends string = string> = {
  front?: ModuleLoaderFactory<N>;
  back?: ModuleLoaderFactory<N>;
};

/**
 * Factory
 */
export type ModuleLoaderFactory<N extends string = string> = (
  e: ModuleLoaderFactoryArgs<N>,
) => ModuleLoaderFactoryRes;
export type ModuleLoaderFactoryArgs<N extends string = string> = {
  name: N;
  theme: ModuleLoaderTheme;

  /**
   * TODO 🐷
   */
  // face: 'Front' | 'Back';
};
export type ModuleLoaderFactoryRes = Promise<t.RenderOutput>;

/**
 * Spinner configuation
 */
export type ModuleLoaderSpinner = {
  bodyOpacity?: t.Percent;
  bodyBlur?: t.Pixels;
  element?: t.RenderOutput | ((e: { theme: ModuleLoaderTheme }) => t.RenderOutput); // Custom spinning renderer.
};

/**
 * Events
 */
export type ModuleLoaderErrorHandler = (e: ModuleLoaderErrorHandlerArgs) => void;
export type ModuleLoaderErrorHandlerArgs = {
  error: any;
  clear(): void;
  closeable(): void;
};
