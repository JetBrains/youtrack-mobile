/* @flow */

import React, {useContext} from 'react';

import Markdown from 'react-native-markdown-display';

import apiHelper from '../api/api__helper';
import getMarkdownRules from './markdown-view-rules';
import MarkdownItInstance from './markdown-instance';
import markdownStyles from './markdown-view-styles';
import {getApi} from '../api/api__instance';
import {getStorageState} from '../storage/storage';
import {hasType} from '../api/api__resource-types';
import {ThemeContext} from '../theme/theme-context';
import {updateMarkdownCheckbox} from './markdown-helper';

import type {Attachment} from '../../flow/CustomFields';
import type {Folder} from '../../flow/User';
import type {Mentions} from './markdown-view-rules';
import type {Theme} from '../../flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


type Props = {
  style?: ViewStyleProp,
  attachments?: Array<Attachment>,
  children: string,
  mentions?: Mentions,
  onCheckboxUpdate?: (checked: boolean, position: number, md: string) => void,
};

function MarkdownView(props: Props) {
  const theme: Theme = useContext(ThemeContext);

  const {
    children,
    attachments = [],
    mentions,
    onCheckboxUpdate = (checked: boolean, position: number, md: string) => {},
  } = props;
  const projects = (getStorageState().projects || []).map((it: Folder) => hasType.project(it) && it);

  const attaches: Array<Attachment> = apiHelper.convertAttachmentRelativeToAbsURLs(
    attachments, getApi().config.backendUrl);
  const onCheckBoxPress = (checked: boolean, position: number): void => {
    onCheckboxUpdate(checked, position, updateMarkdownCheckbox(children, position, checked));
  };

  return (
    <Markdown
      style={markdownStyles(theme.uiTheme)}
      markdownit={MarkdownItInstance}
      rules={getMarkdownRules(attaches, projects, theme.uiTheme, mentions, onCheckBoxPress)}
      ui
    >
      {children}
    </Markdown>
  );
}

export default (React.memo<Props>(MarkdownView): React$AbstractComponent<Props, mixed>);
