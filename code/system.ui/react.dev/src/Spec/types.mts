import * as t from '../common/types.mjs';

type O = Record<string, unknown>;

type Id = string;
type SpecId = Id;
type Color = string | number;
type IgnoredResponse = any | Promise<any>;

export type SpecFillMode = 'fill' | 'fill-x' | 'fill-y';
export type SpecPropDisplay = 'flex' | 'grid' | undefined;

/**
 * Context Wrapper (Manager)
 */
export type SpecCtxWrapper = t.Disposable & {
  readonly id: Id;
  readonly instance: t.DevInstance;
  readonly ctx: SpecCtx;
  readonly props: SpecRenderProps;
  refresh(): Promise<void>;
};

/**
 * Context passed into specs.
 */
export type SpecCtx = {
  readonly component: SpecCtxComponent;
  readonly host: SpecCtxHost;
  readonly debug: SpecCtxDebug;
  readonly initial: boolean; // Flag indicating if this is the initial run (or first run after a reset).
  toObject(): SpecCtxObject;
  run(options?: { reset?: boolean; only?: SpecId | SpecId[] }): Promise<t.DevInfo>;
  reset(): Promise<t.DevInfo>;
  state<T extends O>(initial: T): Promise<SpecCtxState<T>>;
};

export type SpecCtxState<T extends O> = {
  current: T;
  change(fn: (draft: T) => IgnoredResponse): Promise<T>;
};

export type SpecCtxObject = {
  instance: t.DevInstance;
  props: SpecRenderProps;
};

export type SpecCtxComponent = {
  render<T extends O = O>(fn: SubjectRenderer<T>): SpecCtxComponent;
  display(value: SpecPropDisplay): SpecCtxComponent;
  backgroundColor(value?: Color): SpecCtxComponent;
  size(width: number | undefined, height: number | undefined): SpecCtxComponent;
  size(mode: SpecFillMode, margin?: t.MarginInput): SpecCtxComponent;
};

export type SpecCtxHost = {
  backgroundColor(value?: Color): SpecCtxHost;
};

export type SpecCtxDebug = {
  /**
   * TODO 🐷
   */
  TEMP(el: JSX.Element): SpecCtxDebug;
};

/**
 * Rendering state produced by the props
 */
export type SpecRenderProps = {
  id: string;
  component: SpecRenderPropsComponent;
  host: SpecRenderPropsHost;
  debug: SpecRenderPropsDebug;
};

export type SpecRenderPropsComponent = {
  renderer?: SubjectRenderer<any>;
  size?: SpecRenderSize;
  display?: t.SpecPropDisplay;
  backgroundColor?: Color;
};

export type SpecRenderPropsHost = {
  backgroundColor?: Color;
};

export type SpecRenderPropsDebug = {
  main: { elements: JSX.Element[] };
};

export type SpecRenderSize = SpecRenderSizeCenter | SpecRenderSizeFill;
export type SpecRenderSizeCenter = {
  mode: 'center';
  width?: number;
  height?: number;
};
export type SpecRenderSizeFill = {
  mode: 'fill';
  x: boolean;
  y: boolean;
  margin: t.Margin;
};

/**
 * Function that returns a renderable element.
 */
export type SubjectRenderer<T extends O = O> = (
  args: SubjectRendererArgs<T>,
) => JSX.Element | undefined;
export type SubjectRendererArgs<T extends O = O> = { state: T };
