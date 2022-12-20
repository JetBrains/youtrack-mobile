import React, {useContext} from 'react';
import ApiHelper from 'components/api/api__helper';
import AttachmentsRow from 'components/attachments-row/attachments-row';
import usage from 'components/usage/usage';
import {ANALYTICS_ISSUE_STREAM_SECTION} from 'components/analytics/analytics-ids';
import {getApi} from 'components/api/api__instance';
import {ThemeContext} from 'components/theme/theme-context';
import type {Attachment} from 'flow/CustomFields';
import type {Theme} from 'flow/Theme';

const StreamAttachments = ({
  attachments,
}: {
  attachments: Attachment[];
}): React.ReactNode => {
  const theme: Theme = useContext(ThemeContext);
  return (
    attachments?.length && (
      <AttachmentsRow
        attachments={ApiHelper.convertAttachmentRelativeToAbsURLs(
          attachments,
          getApi().config.backendUrl,
        )}
        attachingImage={null}
        onOpenAttachment={(type: string) =>
          usage.trackEvent(
            ANALYTICS_ISSUE_STREAM_SECTION,
            type === 'image' ? 'Showing image' : 'Open attachment by URL',
          )
        }
        uiTheme={theme.uiTheme}
      />
    )
  );
};

export default StreamAttachments;
