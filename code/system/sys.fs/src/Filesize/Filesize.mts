import prettybytes from 'pretty-bytes';
import { FilesizeOptions } from './types.mjs';

/**
 * Convert a number of bytes into a human-readable string.
 */
export const Filesize = (bytes: number, options: FilesizeOptions = {}) => {
  const { locale, round } = options;
  const maximumFractionDigits = typeof round === 'number' ? round : undefined;
  return prettybytes(bytes, { locale, maximumFractionDigits });
};
