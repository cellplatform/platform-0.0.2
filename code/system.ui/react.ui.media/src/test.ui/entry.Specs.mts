export { Pkg } from '../index.pkg.mjs';

export const ServiceSpecs = {
  'sys.ui.media.video.Vimeo': () => import('../ui/vendor.Vimeo/-dev/-SPEC.Vimeo'),
  'sys.ui.media.video.VimeoBackground': () => import('../ui/vendor.Vimeo/-dev/-SPEC.VimeoBg'),
  'sys.ui.media.video.YouTube': () => import('../ui/vendor.YouTube/-dev/-SPEC'),
};

export const Specs = {
  'sys.ui.media.MediaStream': () => import('../ui/MediaStream/-SPEC'),
  'sys.ui.media.AudioPlayer': () => import('../ui/AudioPlayer/-SPEC'),
  'sys.ui.media.RecordButton': () => import('../ui/RecordButton/-SPEC'),
  'sys.ui.media.SeekBar': () => import('../ui/SeekBar/-dev/-SPEC'),
  'sys.ui.media.Concept.Player': () => import('../ui/Concept.Player/-dev/-SPEC'),
  ...ServiceSpecs,
};

export default Specs;
