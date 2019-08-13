/* @flow */

import React, {PureComponent} from 'react';

import Wiki from '../../components/wiki/wiki';

import type {Attachment} from '../../flow/CustomFields';


type Props = {
  backendUrl: string,
  attachments: Array<Attachment>,
  imageHeaders: {Authorization: string},
  onIssueIdTap: () => void,
  title?: string,
  description?: string
}


export default class IssueDescription extends PureComponent<Props, void> {

  render() {
    const {backendUrl, attachments, imageHeaders, onIssueIdTap, title, description} = this.props;

    if (!description) {
      return null;
    }

    return (
      <Wiki
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
