/* @flow */

import React from 'react';

import {useSelector} from 'react-redux';

import API from '../../components/api/api';
import {ActivityStream} from '../../components/activity/activity__stream';
import {getApi} from '../../components/api/api__instance';

import type {User} from '../../flow/User';
import type {UITheme} from '../../flow/Theme';
import type {WorkTimeSettings} from '../../flow/WorkTimeSettings';
import type {YouTrackWiki} from '../../flow/Wiki';
import type {ActivityItem} from '../../flow/Activity';
import type {Attachment} from '../../flow/CustomFields';

type Props = {
  activities: Array<ActivityItem> | null,
  attachments: Array<Attachment>,
  uiTheme: UITheme,
  user: User
};


const getYoutrackWikiProps = (): YouTrackWiki => {
  const api: API = getApi();
  return {
    backendUrl: api.config.backendUrl,
    imageHeaders: api.auth.getAuthorizationHeaders()
  };
};

const ArticleActivityStream = (props: Props) => {
  const {activities, attachments, uiTheme, user} = props;

  const workTimeSettings: WorkTimeSettings = useSelector(store => store.app.workTimeSettings);

  return (
    <ActivityStream
      activities={activities}
      attachments={attachments}
      uiTheme={uiTheme}
      workTimeSettings={workTimeSettings}
      youtrackWiki={getYoutrackWikiProps()}
      onReactionSelect={() => {}}
      currentUser={user}
    />
  );
};

export default React.memo<Props>(ArticleActivityStream);
