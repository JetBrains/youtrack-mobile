import type {ASTNode} from 'react-native-markdown-display';
import Token from 'markdown-it/lib/token';

export type MarkdownNode = ASTNode & {
  key: string;
};

export type MarkdownToken = Token;

export type ScrollData = {
  loadMore: () => any;
};
