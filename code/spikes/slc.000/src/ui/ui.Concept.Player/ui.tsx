import { SeekBar, css, type t } from './common';
import { PlayButton } from './ui.PlayButton';
import { usePlayer } from './usePlayer.mjs';

export const View: React.FC<t.ConceptPlayerProps> = (props) => {
  const { vimeo, slug } = props;
  const player = usePlayer(vimeo);
  const status = player.status;

  /**
   * Handlers
   */
  const handleToggle = () => player.toggle();
  const handleSeekClick: t.SeekBarClickHandler = (e) => {
    if (!status) return;

    /**
     * TODO 🐷
     * - immediate UI update.
     * - wait for "status" to update, then use the new value.
     */

    const secs = status.duration * e.progress;
    player.events?.seek.fire(secs);
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      alignContent: 'center',
      columnGap: 15,
      PaddingX: 8,
    }),
    left: css({ display: 'grid' }),
    right: css({ display: 'grid', alignContent: 'center' }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.left}>
        <PlayButton playing={player.playing} onClick={handleToggle} />
      </div>
      <div {...styles.right}>
        <SeekBar progress={status?.percent} onClick={handleSeekClick} />
      </div>
    </div>
  );
};
