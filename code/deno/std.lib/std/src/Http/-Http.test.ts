import { describe, expect, it, Testing } from '../common/mod.ts';
import { DEFAULTS } from './common';
import { Http } from './mod.ts';

describe('Http', () => {
  const ApplicationJson = DEFAULTS.contentType;
  const TestHttp = Testing.Http;

  describe('HttpFetchClient', () => {
    describe('client.headers', () => {
      it('headers: (default)', () => {
        const client = Http.client();
        expect(client.headers).to.eql({ 'Content-Type': ApplicationJson });
        expect(client.header('Content-Type')).to.eql(ApplicationJson);
      });

      it('header: authToken → headers:{ Authorization } ← Bearer Token', () => {
        const client1 = Http.client({ accessToken: 'my-jwt' });
        const client2 = Http.client({ accessToken: () => 'my-dynamic' });
        expect(client1.header('Authorization')).to.eql(`Bearer ${'my-jwt'}`);
        expect(client2.header('Authorization')).to.eql('my-dynamic');
      });

      it('header: static/dynamic content-type', () => {
        const client1 = Http.client({ contentType: 'foo' });
        const client2 = Http.client({ contentType: () => 'bar' });
        expect(client1.contentType).to.eql('foo');
        expect(client2.contentType).to.eql('bar');
      });
    });
  });

  describe('fetch (HTTP methods/verbs)', () => {
    it('fetch: text', async () => {
      const server = TestHttp.server((req) => new Response('foo'));
      const client = Http.client();

      const url = server.url.join('foo');
      const res = await client.fetch(url);

      expect(res.url).to.eql(url);
      expect(res.status).to.eql(200);
      expect(await res.text()).to.eql('foo');

      await server.dispose();
    });

    it('GET', async () => {
      let _method = '';
      const server = TestHttp.server((req) => {
        _method = req.method;
        return TestHttp.json({ foo: 123 });
      });
      const client = Http.client();
      const url = server.url.join('foo');
      const res = await client.get(url);

      expect(_method).to.eql('GET');
      expect(res.url).to.eql(url);
      expect(res.status).to.eql(200);
      expect(await res.json()).to.eql({ foo: 123 });

      await server.dispose();
    });

    it('HEAD', async () => {
      let _method = '';
      const server = TestHttp.server((req) => {
        _method = req.method;
        return new Response();
      });
      const client = Http.client();
      const url = server.url.join('foo');
      const res = await client.head(url);

      expect(_method).to.eql('HEAD');
      expect(res.url).to.eql(url);
      expect(res.status).to.eql(200);
      await server.dispose();
    });

    it('OPTIONS', async () => {
      let _method = '';
      const server = TestHttp.server((req) => {
        _method = req.method;
        return new Response();
      });
      const client = Http.client();
      const url = server.url.join('foo');
      const res = await client.options(url);

      expect(_method).to.eql('OPTIONS');
      expect(res.url).to.eql(url);
      expect(res.status).to.eql(200);
      await res.text();
      await server.dispose();
    });

    it('PUT', async () => {
      let _method = '';
      const server = TestHttp.server(async (req) => {
        _method = req.method;
        return TestHttp.json({ data: await req.json() });
      });
      const client = Http.client();
      const url = server.url.join('foo');
      const res = await client.put(url, { msg: 'hello' });

      expect(_method).to.eql('PUT');
      expect(res.url).to.eql(url);
      expect(res.status).to.eql(200);
      expect(await res.json()).to.eql({ data: { msg: 'hello' } });
      await server.dispose();
    });

    it('POST', async () => {
      let _method = '';
      const server = TestHttp.server(async (req) => {
        _method = req.method;
        return TestHttp.json({ data: await req.json() });
      });
      const client = Http.client();
      const url = server.url.join('foo');
      const res = await client.post(url, { msg: 'hello' });

      expect(_method).to.eql('POST');
      expect(res.url).to.eql(url);
      expect(res.status).to.eql(200);
      expect(await res.json()).to.eql({ data: { msg: 'hello' } });
      await server.dispose();
    });

    it('PATCH', async () => {
      let _method = '';
      const server = TestHttp.server(async (req) => {
        _method = req.method;
        return TestHttp.json({ data: await req.json() });
      });
      const client = Http.client();
      const url = server.url.join('foo');
      const res = await client.patch(url, { msg: 'hello' });

      expect(_method).to.eql('PATCH');
      expect(res.url).to.eql(url);
      expect(res.status).to.eql(200);
      expect(await res.json()).to.eql({ data: { msg: 'hello' } });
      await server.dispose();
    });

    it('DELETE', async () => {
      let _method = '';
      const server = TestHttp.server((req) => {
        _method = req.method;
        return TestHttp.json({ foo: 123 });
      });
      const client = Http.client();
      const url = server.url.join('foo');
      const res = await client.delete(url);

      expect(_method).to.eql('DELETE');
      expect(res.url).to.eql(url);
      expect(res.status).to.eql(200);
      expect(await res.json()).to.eql({ foo: 123 });
      await server.dispose();
    });
  });
});
