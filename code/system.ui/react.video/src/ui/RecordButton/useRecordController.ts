import { useEffect, useState } from 'react';

import { t } from './common';
import { RecordButtonClickEventHandler, RecordButtonState } from './types';
import { MediaStream } from '../MediaStream';

/**
 * Handles binding the process of recording a MediaStream to
 * the interactions of the <RecordButton>.
 */
export function useRecordController(args: {
  bus: t.EventBus<any>;
  stream?: MediaStream;
  filename?: string;
  onData?: t.MediaStreamRecordOnData;
}) {
  const { stream, filename } = args;
  const bus = args.bus as t.EventBus<t.MediaEvent>;

  const [onClick, setOnClick] = useState<RecordButtonClickEventHandler>();
  const [state, setState] = useState<RecordButtonState>('default');

  useEffect(() => {
    const recorder = stream ? MediaStream.RecordController({ bus, stream }) : undefined;
    const events = MediaStream.Events(bus);

    const handleClick: RecordButtonClickEventHandler = (e) => {
      if (!stream) return;

      const recordEvents = events.record(stream);

      if (e.current === 'default') {
        setState('recording');
        recordEvents.start();
      }

      if (e.current === 'recording') {
        setState('paused');
        recordEvents.pause();
      }

      if (e.current === 'paused') {
        if (e.action === 'finish') {
          setState('default');
          recordEvents.stop({
            download: filename ? { filename } : undefined,
            onData: args.onData,
          });
        }

        if (e.action === 'resume') {
          setState('recording');
          recordEvents.resume();
        }
      }
    };

    setOnClick(() => handleClick);

    return () => {
      recorder?.dispose();
      events.dispose();
    };
  }, [stream?.id]); // eslint-disable-line

  return { onClick, state };
}
