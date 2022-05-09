/* @flow */

import React, {useContext} from 'react';

import ApiHelper from 'components/api/api__helper';
import AttachmentsRow from 'components/attachments-row/attachments-row';
import usage from 'components/usage/usage';
import {ANALYTICS_ISSUE_STREAM_SECTION} from 'components/analytics/analytics-ids';
import {getApi} from 'components/api/api__instance';
import {ThemeContext} from 'components/theme/theme-context';

import type {Attachment} from 'flow/CustomFields';
import type {Theme} from 'flow/Theme';
import type {Node} from 'react';


const StreamAttachments = ({attachments}: { attachments: ?Array<Attachment> }): Node => {
  const files: Array<Attachment> = attachments || [];
  const theme: Theme = useContext(ThemeContext);
  const backendUrl: string = getApi().config.backendUrl;

  return (
    <AttachmentsRow
      attachments={(
        files.length
          ? ApiHelper.convertAttachmentRelativeToAbsURLs(files, backendUrl)
          : []
      )}
      attachingImage={null}
      onOpenAttachment={(type: string) => (
        usage.trackEvent(
          ANALYTICS_ISSUE_STREAM_SECTION, type === 'image' ? 'Showing image' : 'Open attachment by URL'
        )
      )}
      uiTheme={theme.uiTheme}
    />
  );
};

export default StreamAttachments;
