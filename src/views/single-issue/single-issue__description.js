/* @flow */

import React, {PureComponent} from 'react';

import Wiki from '../../components/wiki/wiki';
import MarkdownView from '../../components/wiki/markdown';

import type {Attachment} from '../../flow/CustomFields';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


type Props = {
  backendUrl: string,
  attachments: Array<Attachment>,
  imageHeaders: {Authorization: string},
  onIssueIdTap: () => void,
  title?: string,
  description?: string,
  markdown?: string,
  style?: ViewStyleProp,
}


export default class IssueDescription extends PureComponent<Props, void> {

  render() {
    const {backendUrl, attachments, imageHeaders, onIssueIdTap, title, description, style, markdown} = this.props;

    if (!description && !markdown) {
      return null;
    }

    if (markdown) {
      return (
        <MarkdownView
          attachments={attachments}
        >
          {markdown}
        </MarkdownView>
      );
    }

    return (
      <Wiki
        style={style}
        backendUrl={backendUrl}
        attachments={attachments}
        imageHeaders={imageHeaders}
        onIssueIdTap={onIssueIdTap}
        title={title}
      >
        {description}
      </Wiki>
    );
  }
}
