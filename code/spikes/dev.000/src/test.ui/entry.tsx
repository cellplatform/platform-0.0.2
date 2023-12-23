import { createRoot } from 'react-dom/client';
import { Pkg } from '../index.pkg.mjs';
import { badge } from './ci.badge';

const url = new URL(location.href);
const params = url.searchParams;
const isDev = params.has('dev') || params.has('d');
const isLocalhost = url.hostname === 'localhost' && url.port !== '3000'; // NB: 3000 is the built sample port

/**
 * User Interface
 */
type Subject = 'Dev' | 'Dev:Localhost' | 'DefaultEntry';

const render = async (content: Subject) => {
  const root = createRoot(document.getElementById('root')!);

  if (content === 'Dev') {
    const { Dev } = await import('sys.ui.react.common');
    const { Specs } = await import('./entry.Specs.mjs');
    const el = await Dev.render(Pkg, Specs, { badge, hrDepth: 3 });
    root.render(el);
    return;
  }

  if (content === 'Dev:Localhost') {
    const { Dev } = await import('sys.ui.react.common');
    const { Specs } = await import('./entry.Specs.Localhost.mjs');
    const el = await Dev.render(Pkg, Specs, { badge, hrDepth: 1 });
    root.render(el);
    return;
  }

  if (content === 'DefaultEntry') {
    const { Dev } = await import('sys.ui.react.common');

    const version = Pkg.toString();
    const width = 200;
    const style = { width, borderRadius: 200, useSelect: 'none' };
    const url = '';

    const el = (
      <Dev.Splash footer={version}>
        {/* */}
        {/* <img src={url} style={style} /> */}
      </Dev.Splash>
    );

    root.render(el);
    return;
  }

  throw new Error(`Subject type '${content}' not supported.`);
};

/**
 * ENTRY
 */
(() => {
  if (isDev && isLocalhost) return render('Dev:Localhost');
  if (isDev) return render('Dev');
  return render('DefaultEntry');
})();
