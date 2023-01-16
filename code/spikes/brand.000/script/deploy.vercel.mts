import { Vercel } from 'cloud.vercel';
import pc from 'picocolors';
import { rx } from 'sys.util';

import dotenv from 'dotenv';

import { type t } from '../src/common';
import { Pkg } from '../src/index.pkg.mjs';

dotenv.config();

type DOTENV = {
  VERCEL_TEST_TOKEN: string;
  DEPLOY_PROJECT: string;
  DEPLOY_ALIAS: string;
};
const env = process.env as DOTENV;

const token = env.VERCEL_TEST_TOKEN; // Secure API token (secret).
const project = env.DEPLOY_PROJECT;
const alias = env.DEPLOY_ALIAS;

export async function pushToVercel(args: {
  fs: t.Fs;
  version: string;
  source: string;
  bus?: t.EventBus<any>;
}): Promise<t.LogDeploymentEntry> {
  //
  const { fs, version, source } = args;
  const bus = args.bus ?? rx.bus();
  const vercel = Vercel.client({ bus, token, fs });

  const res = await vercel.deploy({
    name: `${Pkg.name}.v${Pkg.version}`,
    source,
    team: 'tdb',

    project,
    alias,

    ensureProject: true,
    regions: ['sfo1'],
    target: 'production', // NB: required to be "production" for the DNS alias to be applied.
    silent: false, // Standard BEFORE and AFTER deploy logging to console.
    timeout: 99999,
    vercelJson: {
      cleanUrls: true,
      trailingSlash: true,
      rewrites: [
        { source: '/:section/', destination: '/' },
        { source: '/:section/lib/:path', destination: '/lib/:path' },
      ],
    },
  });

  console.info(pc.bold(pc.green(`version: ${pc.white(version)}`)));

  return {
    kind: 'vercel:deployment',
    status: res.status,
    success: res.deployment,
    error: res.error,
  };
}
