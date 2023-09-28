import { Webrtc } from '.';
import { DEFAULTS, Test, expect } from '../test.ui';

export default Test.describe('Webrtc.Peer', (e) => {
  e.it('Peer.options (with args)', (e) => {
    const res = Webrtc.Peer.options(DEFAULTS.signal);
    expect(res.port).to.eql(443);
    expect(res.secure).to.eql(true);
    expect(res.host).to.eql(DEFAULTS.signal.host);
    expect(res.path).to.eql('/' + DEFAULTS.signal.path);
    expect(res.key).to.eql(DEFAULTS.signal.key);
  });

  e.it('Peer.options (no param → defaults)', (e) => {
    const res1 = Webrtc.Peer.options();
    const res2 = Webrtc.Peer.options(DEFAULTS.signal);
    expect(res1).to.eql(res2);
  });
});
