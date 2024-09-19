import { Http, Pkg, describe, expect, it } from './common/mod.ts';
import { DenoCloud } from './mod.ts';

export function testSetup() {
  const app = DenoCloud.server();
  const listener = Deno.serve({ port: 0 }, app.fetch);

  const dispose = () => listener.shutdown();
  const url = Http.url(listener.addr);
  const client = DenoCloud.client(url.base);

  return { app, client, url, dispose } as const;
}

describe('DenoCloud (Server)', () => {
  it('server: start → req/res → dispose', async () => {
    const { url, dispose } = testSetup();
    const client = Http.client();

    const res = await client.get(url.base);
    expect(res.status).to.eql(200);

    const body = await res.json();
    expect(body.module.name).to.eql(Pkg.name);
    expect(body.module.version).to.eql(Pkg.version);

    await dispose();
  });
});