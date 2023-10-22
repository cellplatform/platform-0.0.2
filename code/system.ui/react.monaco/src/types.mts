import type { t } from './common.t';

export * from './ui/ui.MonacoEditor/types.mjs';
export * from './ui.logic/EditorCarets/types.mjs';
export * from './ui.logic/MonacoCrdt/types.mjs';

/**
 * Supported languages.
 */
export type EditorLanguage =
  | 'markdown'
  | 'typescript'
  | 'javascript'
  | 'json'
  | 'yaml'
  | 'go'
  | 'python';
export type EditorTheme = 'Light' | 'Dark';

/**
 * Selection and position.
 */
export type SelectionOffset = { start: number; end: number };
export type CharPosition = { line: number; column: number };
export type CharPositionTuple = [number, number]; // Line:Column.
export type CharRangeTuple = [number, number, number, number]; // Start:[Line:Column], End:[Line:Column]

export type EditorRange = {
  readonly startLineNumber: number;
  readonly startColumn: number;
  readonly endLineNumber: number;
  readonly endColumn: number;
};

export type EditorRangesInput =
  | t.EditorRange
  | t.EditorRange[]
  | t.CharPositionTuple
  | t.CharPositionTuple[]
  | null;

export type EditorRangeInput = t.EditorRange | t.CharPositionTuple | t.CharRangeTuple | null;
