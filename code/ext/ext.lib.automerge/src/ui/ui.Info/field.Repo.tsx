import { Icons, Value, css, type t } from './common';

export function repo(repo: t.InfoData['repo']) {
  if (!repo) return;

  const index = repo.index;
  const name = repo.name || repo.store?.info.storage?.name || 'Unnamed';
  let text = `${name}`;
  if (index) {
    const documents = Value.plural(index.total(), 'document', 'documents');
    text = `${text} ← ${index.total()} ${documents}`;
  }

  const styles = {
    base: css({ Flex: 'x-center-center' }),
  };

  const value = (
    <div {...styles.base}>
      <Icons.Database size={14} offset={[0, 1]} style={{ marginRight: 2 }} />
      <div>{text}</div>
      <Icons.Repo size={14} offset={[0, 1]} style={{ marginLeft: 4 }} />
    </div>
  );

  const res: t.PropListItem = {
    label: repo.label || 'Repo',
    value,
  };

  return res;
}
