import { DenoSubhostingAPI, Path, Pkg, type t } from '../common/mod.ts';

/**
 * Helpers for working with the Deno sub-hosting system.
 * https://docs.deno.com/subhosting/manual
 */
export const Subhosting = {
  /**
   * Setup routes for deploying and managing sub-hosting instances.
   */
  routes(path: string, ctx: t.RouteContext) {
    const { app, env } = ctx;
    const subhosting = new DenoSubhostingAPI({ bearerToken: env.deno.accessToken });
    const orgId = env.deno.orgId;
    const join = Path.join;

    /**
     * GET: root info.
     */
    app.get(path, async (c) => {
      const auth = await ctx.auth.verify(c.req.raw);
      const verified = auth.verified;
      // const organization = await subhosting.organizations.get(env.deno.orgId);

      console.log('auth', auth);
      // if (!auth.verified) return c.json({ error: 'Unauthorized' }, 401);

      const { name, version } = Pkg;
      const module = { name, version };
      const description = `deno:subhosting™️ controller`;
      const identity = auth.claims?.userId ?? '';
      const res: t.SubhostingInfo = {
        description,
        module,
        auth: { identity, verified },
      };

      return c.json(res);
    });

    /**
     * GET: /orgs
     */
    app.get(join(path, '/projects'), async (c) => {

      const projects = await subhosting.organizations.projects.list(orgId);

      // subhosting.organizations.domains.

      // subhosting.projects
      // console.log('m', m);

      const res: t.SubhostingProjectsInfo = { projects };
      return c.json(res);
    });
  },
} as const;
