import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
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

import type {ASTNode} from 'react-native-markdown-display';
import type {Attachment} from 'types/CustomFields';

import type {TextStyleProp} from 'types/Internal';

type Props = {
  attachments?: Attachment[];
  children: string;
  chunkSize?: number;
  maxChunks?: number;
  mentions?: Mentions;
  scrollData?: Record<string, any>;
  onCheckboxUpdate?: (checked: boolean, position: number, markdown: string) => void;
  textStyle?: TextStyleProp;
  isHTML?: boolean;
};
const DEFAULT_CHUNK_SIZE: number = 10;

const MarkdownViewChunks = (props: Props) => {
  const theme: Theme = useContext(ThemeContext);

  const {
    children,
    scrollData = {},
    mentions,
    onCheckboxUpdate = () => {},
    maxChunks,
  } = props;
  const [chunksToRender, updateChunksToRender] = useState(1);
  const [astToRender, updateAstToRender] = useState<ASTNode[][]>([]);

  const chunksRef = useRef<ASTNode[][]>([]);
  const mdRef = useRef<string | null>(null);

  const createChunks = (astNodes: ASTNode[], size: number = DEFAULT_CHUNK_SIZE): ASTNode[][] => {
    const nodes: ASTNode[][] = [];
    let index = 0;
    while (index < astNodes.length) {
      nodes.push(astNodes.slice(index, size + index));
      index += size;
    }
    return nodes;
  };

  const createMarkdown = useCallback(
    (markdown: string) => {
      const tokens = stringToTokens(markdown, MarkdownItInstance);
      const newChunks = createChunks(tokensToAST(tokens), props.chunkSize);
      chunksRef.current = newChunks;
      updateAstToRender(newChunks);
    },
    [props.chunkSize],
  );

  const onCheckboxPress = useCallback(
    (checked: boolean, position: number) => {
      if (mdRef.current && maxChunks == null) {
        onCheckboxUpdate(checked, position, updateMarkdownCheckbox(mdRef.current, position, checked));
      }
    },
    [maxChunks, onCheckboxUpdate],
  );

  const attaches: Attachment[] = useMemo(
    () => apiHelper.convertAttachmentRelativeToAbsURLs(props.attachments || [], getApi().config.backendUrl),
    [props.attachments],
  );

  const rules = useMemo(
    () => getMarkdownRules(attaches, theme.uiTheme, mentions, onCheckboxPress, props.textStyle),
    [attaches, theme.uiTheme, mentions, onCheckboxPress, props.textStyle],
  );

  useEffect(() => {
    createMarkdown(children);
    mdRef.current = children;
  }, [children, createMarkdown]);

  const renderAST = (
    ast: ASTNode[],
    key: string,
  ): React.ReactElement<React.ComponentProps<typeof MarkdownAST>, typeof MarkdownAST> => {
    return <MarkdownAST textStyle={props.textStyle} testID="chunk" key={key} ast={ast} rules={rules} />;
  };

  if (!children || astToRender?.length === 0) {
    return null;
  }

  const hasMore: boolean = maxChunks != null ? false : chunksToRender + 1 <= chunksRef.current.length;

  scrollData.loadMore = () => {
    if (maxChunks != null) {
      return;
    }

    const number = chunksToRender + 1;

    if (number <= chunksRef.current.length) {
      updateChunksToRender(number);
    }
  };

  return (
    <View testID="markdownViewChunks">
      {astToRender.slice(0, maxChunks || chunksToRender).map((astPart, index) => renderAST(astPart, `chunk-${index}`))}

      {hasMore && <SkeletonIssueContent />}
      {maxChunks != null && astToRender.length > maxChunks && <Text>{'…\n'}</Text>}
    </View>
  );
};

export default React.memo<Props>(MarkdownViewChunks);
