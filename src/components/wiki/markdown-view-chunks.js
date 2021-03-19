/* @flow */

import React, {useEffect, useState} from 'react';

import {stringToTokens, tokensToAST} from 'react-native-markdown-display';

import apiHelper from '../../components/api/api__helper';
import MarkdownAST from '../../components/wiki/markdown-ast';
import MarkdownItInstance from './markdown-instance';
import {getApi} from '../api/api__instance';
import getMarkdownRules from './markdown-view-rules';
import {getStorageState} from '../storage/storage';
import {hasType} from '../api/api__resource-types';

import type {Article} from '../../flow/Article';
import type {Attachment} from '../../flow/CustomFields';
import type {Folder} from '../../flow/User';
import type {IssueOnList} from '../../flow/Issue';
import type {MarkdownNode} from '../../flow/Markdown';
import type {UITheme} from '../../flow/Theme';
import {SkeletonIssueContent} from '../skeleton/skeleton';

type Props = {
  attachments?: Array<Attachment>,
  children: string,
  chunkSize?: number,
  mentionedArticles?: Array<Article>,
  mentionedIssues?: Array<IssueOnList>,
  uiTheme: UITheme,
  scrollData?: Object
};


let chunks: Array<Array<MarkdownNode>> = [];
let rules: Object = {};

const MarkdownViewChunks = (props: Props) => {
  const {children, scrollData = {}, mentionedArticles = [], mentionedIssues = []} = props;

  if (!children) {
    return null;
  }

  const [chunksToRender, updateChunksToRender] = useState(1);
  const [astToRender, updateAstToRender] = useState([]);


  useEffect(() => {
    const projects: Array<Folder> = (getStorageState().projects || []).map((it: Folder) => hasType.project(it) && it);
    const attaches: Array<Attachment> = apiHelper.convertAttachmentRelativeToAbsURLs(
      props.attachments || [],
      getApi().config.backendUrl
    );
    rules = getMarkdownRules(attaches, projects, props.uiTheme, {
      articles: mentionedArticles,
      issues: mentionedIssues,
    });
    return () => {
      chunks = [];
      rules = {};
    };
  }, []);


  useEffect(() => {
    const ast: Array<MarkdownNode> = tokensToAST(stringToTokens(children, MarkdownItInstance));
    chunks = createChunks(ast, props.chunkSize);
    updateAstToRender(chunks);
  }, [children]);


  if (astToRender?.length === 0) {
    return null;
  }

  const hasMore: boolean = (chunksToRender + 1) <= chunks.length;
  scrollData.loadMore = () => {
    const number = chunksToRender + 1;
    if (number <= chunks.length) {
      updateChunksToRender(number);
    }
  };

  return (
    <>
      {
        astToRender.slice(0, chunksToRender).map((astPart, index) => {
          return (
            <MarkdownAST
              key={`chunk-${index}`}
              ast={astPart}
              rules={rules}
              uiTheme={props.uiTheme}
            />
          );
        })
      }

      {hasMore && <SkeletonIssueContent/>}
    </>
  );

};

export default React.memo<Props>(MarkdownViewChunks);


function createChunks(array, size = 10) {
  const chunked_arr = [];
  let index = 0;
  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }
  return chunked_arr;
}
