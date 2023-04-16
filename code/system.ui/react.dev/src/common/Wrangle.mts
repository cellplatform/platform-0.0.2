import type * as t from './types.mjs';
import { DEFAULTS } from './const.mjs';

const QS = DEFAULTS.qs;

export const WrangleUrlParams = {
  /**
   * Determine if the given URL is a "dev mode" address.
   */
  isDev(location?: t.UrlInput) {
    const params = WrangleUrl.location(location).searchParams;
    return params.has(QS.d) || params.has(QS.dev);
  },

  formatDevFlag(options: { location?: t.UrlInput } = {}) {
    const url = WrangleUrl.location(options.location);

    if (url.searchParams.has(QS.d)) {
      const value = url.searchParams.get(QS.d) || 'true';
      url.searchParams.delete(QS.d);
      url.searchParams.set(QS.dev, value);
      if (!options.location) {
        window.location.search = url.searchParams.toString();
      }
    }

    return url;
  },

  ensureIndexDevFlag(options: { location?: t.UrlInput } = {}) {
    const url = WrangleUrl.location(options.location);
    const params = url.searchParams;
    params.delete(DEFAULTS.qs.d);
    params.delete(DEFAULTS.qs.dev);
    params.set(DEFAULTS.qs.dev, 'true');
    if (!options.location) {
      window.location.search = url.searchParams.toString();
    }
    return url;
  },
};

export const WrangleUrl = {
  navigate: WrangleUrlParams,

  /**
   * Convert an input location into a standard [URL] object.
   */
  location(value?: t.UrlInput): URL {
    if (!value) return new URL(window.location.href);
    return typeof value === 'string' ? new URL(value) : new URL(value.href);
  },

  /**
   * Derive and load the module from the given URL.
   */
  async module(url: URL, specs: t.SpecImports) {
    const params = url.searchParams;
    if (!params.has(QS.dev)) return undefined;

    const namespace = params.get(QS.dev) ?? '';
    const matches = WrangleUrl.moduleMatches(namespace, specs);

    if (matches[0]) {
      const res = await matches[0].fn();
      if (typeof res !== 'object') return undefined;
      if (res.default?.kind === 'TestSuite') return res.default;
      console.warn(`Imported default from field "${namespace}" is not of kind "TestSuite"`);
    }

    return undefined;
  },

  /**
   * Match fields on the spec {Imports} object with the given query-string key name.
   */
  moduleMatches(field: string, specs: t.SpecImports) {
    if (!field) return [];
    return Object.keys(specs)
      .filter((key) => key === field)
      .map((namespace) => ({ namespace, fn: (specs as any)[namespace] }))
      .filter(({ fn }) => typeof fn === 'function');
  },
};

export const DevWrangle = {
  Url: WrangleUrl,
  Params: WrangleUrlParams,
};
