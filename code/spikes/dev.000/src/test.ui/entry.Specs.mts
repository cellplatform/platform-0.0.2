const { Specs: CommonSpecs, DevSpecs: ComonDevSpecs } = await import('sys.ui.react.common');
const { ModuleSpecs: DevSpecs } = await import('sys.ui.react.dev');
const { Specs: MonacoSpecs } = await import('sys.ui.react.monaco');
const { Specs: MediaSpecs } = await import('sys.ui.react.media');
const { Specs: WebRtcSpecs } = await import('sys.net.webrtc');
const { Specs: FsIndexedDbSpecs } = await import('sys.fs.indexeddb');
const { Specs: VendorStripe } = await import('vendor.stripe');
const { Specs: CrdtSpecs } = await import('sys.data.crdt');

export const Specs = {
  Root: () => import('../ui/Root/Root.SPEC'),
  ...WebRtcSpecs,
  ...CrdtSpecs,
  ...MonacoSpecs,
  ...CommonSpecs,
  ...ComonDevSpecs,
  ...DevSpecs,
  ...MediaSpecs,
  ...FsIndexedDbSpecs,
  ...VendorStripe,
};
