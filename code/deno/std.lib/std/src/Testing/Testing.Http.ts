import { type t } from '../common/mod.ts';
import { HttpUrl } from '../Http/Http.Url.ts';

type M = 'GET' | 'PUT' | 'POST' | 'DELETE';
type H = { method: M; handler: Deno.ServeHandler };

/**
 * HTTP test server
 */
export const TestingHttp = {
  /**
   * Create and start a new HTTP test server.
   */
  create(defaultHandler?: Deno.ServeHandler): t.TestingHttp {
    let _disposed = false;

    const server = Deno.serve({ port: 0 }, (req, info) => {
      const list = Array.from(handlers).filter((item) => item.method === req.method);
      if (list.length > 0) return list[0].handler(req, info);
      if (defaultHandler) return defaultHandler?.(req, info);
      return new Response('404 Not Found', { status: 404 });
    });

    const handlers = new Set<H>();
    const addr = server.addr;
    const url = HttpUrl.create(`http://${addr.hostname}:${addr.port}`);

    const api: t.TestingHttp = {
      addr,
      url,
      get disposed() {
        return _disposed;
      },
      async dispose() {
        _disposed = true;
        await server.shutdown();
      },
      get(handler) {
        handlers.add({ method: 'GET', handler });
        return api;
      },
      put(handler) {
        handlers.add({ method: 'PUT', handler });
        return api;
      },
      post(handler) {
        handlers.add({ method: 'POST', handler });
        return api;
      },
      delete(handler) {
        handlers.add({ method: 'DELETE', handler });
        return api;
      },
    };

    return api;
  },
};
