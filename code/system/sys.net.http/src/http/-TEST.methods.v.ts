import { Http } from '.';
import { Path, TestServer, describe, expect, it } from '../test';

describe('Http', () => {
  describe('init: methods', () => {
    it('create from [fetcher] function', async () => {
      const server = TestServer.listen({ count: 123 });
      const methods = Http.methods(Http.fetcher());
      const res = await methods.get(server.url);
      server.close();
      expect(res.status).to.eql(200);
      expect(res.data).to.eql({ count: 123 });
    });

    it('create from {options}', async () => {
      const accessToken = '0xAbc';
      const server = TestServer.listen({}, { accessToken });
      const res1 = await Http.methods({ accessToken }).get(server.url);
      const res2 = await Http.methods().get(server.url);
      server.close();
      expect(res1.status).to.eql(200);
      expect(res2.status).to.eql(401);
    });
  });

  describe('init: origin', () => {
    /**
     * TODO 🐷
     */
  });

  describe('methods', () => {
    it('get', async () => {
      const data = { foo: 123 };
      const server = TestServer.listen(data);

      const fetch = Http.fetcher();
      const raw = Http.methods(fetch);
      const origin = Http.origin(fetch, server.url);

      const res1 = await raw.get(server.url);
      const res2 = await origin.get('foo/bar');
      server.close();

      expect(res1.data).to.eql(data);
      expect(res2.data).to.eql(data);
      expect(res2.url).to.eql(Path.join(server.url, 'foo/bar'));
    });
  });
});
