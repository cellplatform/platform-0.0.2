import { Filesystem, NodeFs } from 'sys.fs.node';
import { Text } from 'sys.text/node';
import { rx, slug, Time } from 'sys.util';

import { ContentBundle } from '../src/Content.Bundle/index.mjs';
import { pushToVercel } from './deploy.vercel.mjs';
import { t } from '../src/common.mjs';

const token = process.env.VERCEL_TEST_TOKEN || ''; // Secure API token (secret).
const bus = rx.bus();

const toFs = async (dir: string) => {
  dir = NodeFs.resolve(dir);
  const store = await Filesystem.client(dir, { bus });
  return store.fs;
};

const content = await ContentBundle({
  Text,
  throwError: true,
  src: {
    app: await toFs('./dist/web'),
    content: await toFs('../../../../../live-state/tdb.meeting/undp'),
  },
});

const targetfs = await toFs('./dist.deploy');
const logfs = await toFs('./dist.deploy/.log');
const publicfs = await toFs('./public');

console.log('content', content);

const bundle = await content.write.bundle(targetfs);
const version = content.version;

await content.write.data(publicfs);

console.log('-------------------------------------------');
console.log('bundle (write response):', bundle);
console.log();
console.log('sizes:', bundle.size);

// process.exit(0); // TEMP 🐷

/**
 * Deploy
 */
const deployed = await pushToVercel({
  fs: bundle.fs,
  token,
  version,
  source: bundle.dir.app,
});

console.log('-------------------------------------------');
console.log('deployed', deployed.status);

/**
 * Write deployment to the file-log.
 */
const filename = `${Time.now.timestamp}-${slug()}.log.json`;
const logentry = {
  bundle: bundle.toObject(),
  deployment: deployed.toObject(),
};
await logfs.write(filename, JSON.stringify(logentry));
