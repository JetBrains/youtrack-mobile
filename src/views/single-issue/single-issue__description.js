/* @flow */

import React, {PureComponent} from 'react';

import Wiki from '../../components/wiki/wiki';

import type {Attachment} from '../../flow/CustomFields';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


type Props = {
  backendUrl: string,
  attachments: Array<Attachment>,
  imageHeaders: {Authorization: string},
  onIssueIdTap: () => void,
  title?: string,
  description?: string,
  style?: ViewStyleProp,
}


export default class IssueDescription extends PureComponent<Props, void> {

  render() {
    const {backendUrl, attachments, imageHeaders, onIssueIdTap, title, description, style} = this.props;

    if (!description) {
      return null;
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
