/* @flow */

import React from 'react';

import Markdown from 'react-native-markdown-display';

import apiHelper from '../api/api__helper';
import getMarkdownRules from './markdown-view-rules';
import MarkdownItInstance from './markdown-instance';
import markdownStyles from './markdown-view-styles';
import {getApi} from '../api/api__instance';
import {getStorageState} from '../storage/storage';
import {hasType} from '../api/api__resource-types';

import type {Attachment} from '../../flow/CustomFields';
import type {Folder} from '../../flow/User';
import type {Mentions} from './markdown-view-rules';
import type {UITheme} from '../../flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


type Props = {
  style?: ViewStyleProp,
  attachments?: Array<Attachment>,
  children: string,
  mentions?: Mentions,
  uiTheme: UITheme,
  onCheckboxUpdate?: (checked: boolean, position: number) => void,
};

function MarkdownView(props: Props) {
  const {children, attachments = [], uiTheme, mentions, onCheckboxUpdate = () => {}} = props;
  const projects = (getStorageState().projects || []).map((it: Folder) => hasType.project(it) && it);

  const attaches: Array<Attachment> = apiHelper.convertAttachmentRelativeToAbsURLs(attachments, getApi().config.backendUrl);

  return (
    <Markdown
      style={markdownStyles(uiTheme)}
      markdownit={MarkdownItInstance}
      rules={getMarkdownRules(attaches, projects, uiTheme, mentions, onCheckboxUpdate)}
      ui
    >
      {children}
    </Markdown>
  );
}

export default React.memo<Props>(MarkdownView);
