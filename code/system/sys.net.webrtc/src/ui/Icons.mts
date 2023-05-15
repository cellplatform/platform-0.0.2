import { FaNetworkWired } from 'react-icons/fa';
import {
  MdCamera,
  MdClose,
  MdDelete,
  MdDone,
  MdDoneOutline,
  MdEmojiPeople,
  MdError,
  MdKeyboard,
  MdLanguage,
  MdMemory,
  MdMic,
  MdMicOff,
  MdMultipleStop,
  MdOutlineBadge,
  MdOutlineScreenShare,
  MdOutlineStopScreenShare,
  MdOutlineVideoCameraFront,
  MdOutlineVideocamOff,
  MdOutlineViewInAr,
  MdPublic,
  MdPublicOff,
  MdSettingsInputAntenna,
  MdStart,
  MdVpnLock,
  MdWifiTethering,
  MdWifiTetheringOff,
  MdRefresh,
  MdCable,
} from 'react-icons/md';
import { VscGithubAction } from 'react-icons/vsc';
import { Icon } from 'sys.ui.react.common';

const icon = Icon.renderer;

/**
 * Icon collection.
 */
export const Icons = {
  Refresh: icon(MdRefresh),
  Cable: icon(MdCable),
  Close: icon(MdClose),
  Delete: { Bin: icon(MdDelete) },
  Cube: icon(MdOutlineViewInAr),
  Person: icon(MdEmojiPeople),
  Screenshare: {
    Start: icon(MdOutlineScreenShare),
    Stop: icon(MdOutlineStopScreenShare),
  },
  Mic: {
    On: icon(MdMic),
    Off: icon(MdMicOff),
  },
  Camera: {
    On: icon(MdCamera),
  },
  Video: {
    On: icon(MdOutlineVideoCameraFront),
    Off: icon(MdOutlineVideocamOff),
  },
  Identity: {
    Badge: icon(MdOutlineBadge),
  },
  Done: {
    Outline: icon(MdDoneOutline),
    Solid: icon(MdDone),
  },
  Note: { Event: icon(VscGithubAction) },
  Keyboard: icon(MdKeyboard),
  Globe: {
    Language: icon(MdLanguage),
    On: icon(MdPublic),
    Off: icon(MdPublicOff),
    Lock: icon(MdVpnLock),
  },
  Connection: { On: icon(MdWifiTethering), Off: icon(MdWifiTetheringOff) },
  Arrow: { Start: icon(MdStart), TwoWay: icon(MdMultipleStop) },
  Error: icon(MdError),
  Memory: icon(MdMemory),
  Network: {
    Antenna: icon(MdSettingsInputAntenna),
    Nodes: icon(FaNetworkWired),
  },
};
