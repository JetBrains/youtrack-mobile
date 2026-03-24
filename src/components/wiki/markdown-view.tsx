import React, {useCallback, useContext, useMemo} from 'react';

import Markdown from 'react-native-markdown-display';

import apiHelper from 'components/api/api__helper';
import getMarkdownRules from './markdown-view-rules';
import HTML from './markdown/markdown-html';
import MarkdownItInstance from './markdown-instance';
import markdownStyles from './markdown-view-styles';
import {getApi} from 'components/api/api__instance';
import {prepareHTML} from 'components/wiki/markdown-helper';
import {ThemeContext} from 'components/theme/theme-context';
import {updateMarkdownCheckbox} from './markdown-helper';

import type {Attachment} from 'types/CustomFields';
import type {Mentions} from './markdown-view-rules';
import type {Theme} from 'types/Theme';
import type {TextStyleProp} from 'types/Internal';

type Props = {
  textStyle?: TextStyleProp;
  attachments?: Attachment[];
  children: string;
  mentions?: Mentions;
  onCheckboxUpdate?: (checked: boolean, position: number, md: string) => void;
  isHTML?: boolean;
};

function MarkdownView(props: Props) {
  const theme: Theme = useContext(ThemeContext);
  const {
    children,
    attachments = [],
    mentions,
    onCheckboxUpdate = (checked: boolean, position: number, md: string) => {},
    isHTML,
  } = props;

  const attaches: Attachment[] = useMemo(
    () => apiHelper.convertAttachmentRelativeToAbsURLs(attachments, getApi().config.backendUrl),
    [attachments],
  );

  const onCheckBoxPress = useCallback(
    (checked: boolean, position: number): void => {
      onCheckboxUpdate(checked, position, updateMarkdownCheckbox(children, position, checked));
    },
    [children, onCheckboxUpdate],
  );

  const rules = useMemo(
    () => getMarkdownRules(attaches, theme.uiTheme, mentions, onCheckBoxPress, props.textStyle),
    [attaches, theme.uiTheme, mentions, onCheckBoxPress, props.textStyle],
  );

  const styles = useMemo(
    () => markdownStyles(theme.uiTheme, props.textStyle),
    [theme.uiTheme, props.textStyle],
  );

  return isHTML ? (
    <HTML html={prepareHTML(children)} />
  ) : (
    <Markdown style={styles} markdownit={MarkdownItInstance} rules={rules}>
      {children}
    </Markdown>
  );
}

export default React.memo<Props>(MarkdownView);
