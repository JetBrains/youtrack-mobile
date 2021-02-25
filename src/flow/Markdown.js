import {ReactElement} from 'react';

export type MarkdownNode = {
  attributes: Object,
  content: string,
  children: Array<ReactElement>,
  key: string,
  sourceInfo: string,
};
