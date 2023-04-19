import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Text, View} from 'react-native';

import {stringToTokens, tokensToAST} from 'react-native-markdown-display';

import apiHelper from 'components/api/api__helper';
import getMarkdownRules, {Mentions} from './markdown-view-rules';
import MarkdownAST from 'components/wiki/markdown-ast';
import MarkdownItInstance from './markdown-instance';
import {getApi} from 'components/api/api__instance';
import {SkeletonIssueContent} from 'components/skeleton/skeleton';
import {ThemeContext} from 'components/theme/theme-context';
import {Theme} from 'types/Theme';
import {updateMarkdownCheckbox} from './markdown-helper';

import type {Article} from 'types/Article';
import type {ASTNode} from 'react-native-markdown-display';
import type {Attachment} from 'types/CustomFields';
import type {IssueOnList} from 'types/Issue';
import type {MarkdownToken} from 'types/Markdown';
import type {TextStyleProp} from 'types/Internal';
import type {UITheme} from 'types/Theme';

type Props = {
  attachments?: Attachment[];
  children: string;
  chunkSize?: number;
  maxChunks?: number;
  mentionedArticles?: Article[];
  mentionedIssues?: IssueOnList[];
  mentions?: Mentions;
  uiTheme?: UITheme;
  scrollData?: Record<string, any>;
  onCheckboxUpdate?: (checked: boolean, position: number, markdown: string) => (...args: any[]) => any;
  textStyle?: TextStyleProp;
  isHTML?: boolean;
};
const DEFAULT_CHUNK_SIZE: number = 10;
let chunks: ASTNode[] = [];
let rules: Record<string, any> = {};
let tokens: MarkdownToken[] = [];
let md: string | null = null;

const MarkdownViewChunks = (props: Props) => {
  const theme: Theme = useContext(ThemeContext);

  const {
    children,
    scrollData = {},
    mentionedArticles = [],
    mentionedIssues = [],
    mentions,
    onCheckboxUpdate = (
      checked: boolean,
      position: number,
      markdown: string,
    ) => {},
    maxChunks,
  } = props;
  const [chunksToRender, updateChunksToRender] = useState(1);
  const [astToRender, updateAstToRender] = useState<ASTNode[]>([]);
  const createMarkdown = useCallback(
    (markdown: string): void => {
      tokens = stringToTokens(markdown, MarkdownItInstance);
      chunks = createChunks(tokensToAST(tokens), props.chunkSize);
      updateAstToRender(chunks);
    },
    [props.chunkSize],
  );

  const onCheckboxPress = (checked: boolean, position: number): void => {
    if (md && maxChunks == null) {
      onCheckboxUpdate(
        checked,
        position,
        updateMarkdownCheckbox(md, position, checked),
      );
    }
  };

  const createRules = (): Record<string, any> => {
    const attaches: Attachment[] = apiHelper.convertAttachmentRelativeToAbsURLs(
      props.attachments || [],
      getApi().config.backendUrl,
    );
    return getMarkdownRules(
      attaches,
      props?.uiTheme || theme.uiTheme,
      mentions || {
        articles: mentionedArticles,
        issues: mentionedIssues,
        users: [],
      },
      onCheckboxPress,
      props.textStyle,
    );
  };

  useEffect(() => {
    rules = createRules();
    return () => {
      tokens = [];
      rules = {};
      md = null;
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    createMarkdown(children);
    md = children;
  }, [children, createMarkdown]);

  const renderAST = (
    ast: ASTNode[],
    key: string,
  ): React.ReactElement<
    React.ComponentProps<typeof MarkdownAST>,
    typeof MarkdownAST
  > => {
    return (
      <MarkdownAST
        textStyle={props.textStyle}
        testID="chunk"
        key={key}
        ast={ast}
        rules={rules}
      />
    );
  };

  if (!children || astToRender?.length === 0) {
    return null;
  }

  const hasMore: boolean =
    maxChunks != null ? false : chunksToRender + 1 <= chunks.length;

  scrollData.loadMore = () => {
    if (maxChunks != null) {
      return;
    }

    const number = chunksToRender + 1;

    if (number <= chunks.length) {
      updateChunksToRender(number);
    }
  };

  return (
    <View testID="markdownViewChunks">
      {astToRender
        .slice(0, maxChunks || chunksToRender)
        .map((astPart, index) => renderAST(astPart, `chunk-${index}`))}

      {hasMore && <SkeletonIssueContent />}
      {maxChunks != null && astToRender.length > maxChunks && (
        <Text>{'…\n'}</Text>
      )}
    </View>
  );
};

export default React.memo<Props>(MarkdownViewChunks);


function createChunks(
  array: ASTNode[],
  size: number = DEFAULT_CHUNK_SIZE,
): ASTNode[] {
  const chunked_arr: ASTNode[] = [];
  let index = 0;

  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }

  return chunked_arr;
}
