import { load } from 'https://deno.land/std/dotenv/mod.ts';
const env = await load();

/**
 * Environment Variables (.env file)
 */
export const EnvVars = {
  /**
   * OpenAI
   * https://platform.openai.com/api-keys
   */
  openai: { apiKey: env['OPENAI_API_KEY'] },

  /**
   * Deno Cloud
   */
  deno: {
    /**
     * Organization: "sys" (Subhosting)
     * https://docs.deno.com/subhosting/manual
     */
    accessToken: env['SYS_DEPLOY_ACCESS_TOKEN'],
    orgId: env['SYS_DEPLOY_ORG_ID'],
  },
} as const;