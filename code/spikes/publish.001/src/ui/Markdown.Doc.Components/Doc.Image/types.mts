export type DocImageAlign = 'Left' | 'Center' | 'Right';

export type DocImageType = DocImageYaml & {
  kind: 'doc.Image';
};

export type DocImageYaml = {
  src?: string;
  alt?: string;
  align?: DocImageAlign;
  width?: number;
  border?: number;
  radius?: number;
  margin?: { top?: number; bottom?: number };
  offset?: { x?: number; y?: number };
  caption?: string;
};

export type DocImageCaption = {
  text: string;
  align?: DocImageAlign;
};
