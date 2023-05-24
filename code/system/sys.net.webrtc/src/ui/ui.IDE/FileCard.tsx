import { t, CrdtInfo } from './common';

export type FileCardProps = {
  title?: t.PropListProps['title'];
  doc: t.CrdtDocRef<any>;
  file?: t.CrdtDocFile<any>;
  filepath?: string;
  syncer?: t.CrdtDocSync<any>;
  margin?: t.CssEdgesInput;
  style?: t.CssValue;
};

export const FileCard: React.FC<FileCardProps> = (props) => {
  const { doc, syncer } = props;
  if (!doc) return null;

  const history = doc.history;
  const latest = history[history.length - 1];
  const data: t.CrdtInfoData = {
    file: { doc: props.file, path: props.filepath },
    history: {
      data: history,
      item: { data: latest, title: 'Latest Commit' },
    },
  };

  const fields: t.CrdtInfoFields[] = [
    'Module.Verify',
    'Module',
    'Driver.Runtime',
    'History',
    'History.Item',
    'History.Item.Message',
    'File',
  ];

  if (syncer) {
    fields.push('Network');
    data.network = { doc: syncer };
  }

  /**
   * [Render]
   */
  return (
    <CrdtInfo
      title={Wrangle.title(props)}
      fields={fields}
      data={data}
      card={true}
      margin={props.margin}
    />
  );
};

/**
 * Helpers
 */

const Wrangle = {
  title(props: FileCardProps) {
    const title = CrdtInfo.Wrangle.title(props.title || 'CRDT Document');
    return {
      ...title,
      margin: title.margin ?? [0, 0, 15, 0],
    };
  },
};
