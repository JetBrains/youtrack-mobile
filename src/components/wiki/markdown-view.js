/* @flow */

import React from 'react';

import Markdown, {MarkdownIt} from 'react-native-markdown-display';
import getMarkdownRules from './markdown-view-rules';
import markdownStyles from './markdown-view-styles';

import apiHelper from '../api/api__helper';
import {getApi} from '../api/api__instance';
import {hasType} from '../api/api__resource-types';
import {getStorageState} from '../storage/storage';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {Attachment} from '../../flow/CustomFields';
import type {Folder} from '../../flow/User';
import type {UITheme} from '../../flow/Theme';


type Props = {
  style?: ViewStyleProp,
  attachments?: Array<Attachment>,
  children: string,
  mentions?: { articles: Array<string>, issues: Array<string> },
  uiTheme: UITheme
};

const markdownItInstance: MarkdownIt = MarkdownIt({typographer: true, breaks: true, linkify: true});
markdownItInstance.linkify.set({fuzzyEmail: false, fuzzyLink: true});

function MarkdownView(props: Props) {
  const {children, attachments = [], uiTheme, mentions} = props;
  const projects = (getStorageState().projects || []).map((it: Folder) => hasType.project(it) && it);

  const attaches: Array<Attachment> = apiHelper.convertAttachmentRelativeToAbsURLs(attachments, getApi().config.backendUrl);

  return (
    <Markdown
      style={markdownStyles(uiTheme)}
      markdownit={markdownItInstance}
      rules={getMarkdownRules(attaches, projects, uiTheme, mentions)}
      ui
    >
      {children}
    </Markdown>
  );
}

export default React.memo<Props>(MarkdownView);
