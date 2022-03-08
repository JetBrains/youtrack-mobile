import type {ASTNode} from 'react-native-markdown-display';

export type MarkdownNode = ASTNode & {key: string};

export type ScrollData = {
  loadMore: () => any,
};
