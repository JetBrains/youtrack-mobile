import React, {useContext} from 'react';
import Markdown from 'react-native-markdown-display';
import apiHelper from '../api/api__helper';
import getMarkdownRules from './markdown-view-rules';
import HTML from './renderers/renderer__html';
import MarkdownItInstance from './markdown-instance';
import markdownStyles from './markdown-view-styles';
import {getApi} from '../api/api__instance';
import {getStorageState} from '../storage/storage';
import {hasType} from '../api/api__resource-types';
import {prepareHTML} from 'components/wiki/markdown-helper';
import {ThemeContext} from '../theme/theme-context';
import {updateMarkdownCheckbox} from './markdown-helper';
import type {Attachment} from 'types/CustomFields';
import type {Folder} from 'types/User';
import type {Mentions} from './markdown-view-rules';
import type {Theme} from 'types/Theme';
import type {TextStyleProp} from 'types/Internal';
type Props = {
  textStyle?: TextStyleProp;
  attachments?: Array<Attachment>;
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
  const projects = (getStorageState().projects || []).map(
    (it: Folder) => hasType.project(it) && it,
  );
  const attaches: Array<Attachment> = apiHelper.convertAttachmentRelativeToAbsURLs(
    attachments,
    getApi().config.backendUrl,
  );

  const onCheckBoxPress = (checked: boolean, position: number): void => {
    onCheckboxUpdate(
      checked,
      position,
      updateMarkdownCheckbox(children, position, checked),
    );
  };

  return isHTML ? (
    <HTML html={prepareHTML(children)} />
  ) : (
    <Markdown
      style={markdownStyles(theme.uiTheme, props.textStyle)}
      markdownit={MarkdownItInstance}
      rules={getMarkdownRules(
        attaches,
        projects,
        theme.uiTheme,
        mentions,
        onCheckBoxPress,
        props.textStyle,
      )}
      ui
    >
      {children}
    </Markdown>
  );
}

export default React.memo<Props>(MarkdownView) as React$AbstractComponent<
  Props,
  unknown
>;
