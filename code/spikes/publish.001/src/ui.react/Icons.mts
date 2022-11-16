import { MdAutoStories, MdFace, MdOpenInFull, MdSupport, MdVolumeOff } from 'react-icons/md';
import { Icon } from 'sys.ui.react.common';

const icon = Icon.renderer;

/**
 * Icon collection.
 */
export const Icons = {
  Face: icon(MdFace),
  Book: icon(MdAutoStories),
  Expand: icon(MdOpenInFull),
  Support: icon(MdSupport),
  Muted: icon(MdVolumeOff),
};
