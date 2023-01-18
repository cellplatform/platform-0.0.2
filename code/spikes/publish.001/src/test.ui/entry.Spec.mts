export const Spec = {
  'spike.dev': () => import('../ui/Root/-dev/Root.DevEnv.SPEC'),
  'spike.ui.Root': () => import('../ui/Root/-dev/Root.SPEC'),
  'spike.ui.TileOutline': () => import('../ui/Tile.Outline/TileOutline.SPEC'),
  'spike.ui.Video.Diagram': () => import('../ui/Video.Diagram/ui.VideoDiagram.SPEC'),
  'spike.ui.Video.ProgressBar': () => import('../ui/Video.ProgressBar/ui.ProgressBar.SPEC'),
};
