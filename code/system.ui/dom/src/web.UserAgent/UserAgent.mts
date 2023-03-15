import UAParser from 'ua-parser-js';
import type { t } from '../common.t';

/**
 * Ref:
 *    https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent
 *
 *    Summary:
 *    "The User-Agent request header is a characteristic string that lets
 *     servers and network peers identify the application, operating system,
 *     vendor, and/or version of the requesting user agent.""
 */
export const UserAgent = {
  /**
   * Convert a browser user-agent string into a structured object.
   * Example:
   *
   *    const ua = UserAgent.parse(navigator.userAgent);
   * '
   */
  parse(input: t.UserAgentString): t.UserAgent {
    const parser = UAParser((input || '').trim());
    const { browser, engine, os } = parser;
    return {
      browser: {
        name: asString(browser.name),
        version: asString(browser.version),
        major: asString(browser.major),
      },
      engine: {
        name: asString(engine.name),
        version: asString(engine.version),
      },
      os: {
        name: asString(os.name),
        version: asString(os.version),
      },
    };
  },
};

/**
 * Helpers
 */
function asString(input?: string) {
  return (input || '').trim();
}
