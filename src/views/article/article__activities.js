/* @flow */

import React, {useEffect} from 'react';
import {ScrollView} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import API from '../../components/api/api';
import {ActivityStream} from '../../components/activity/activity__stream';
import {createActivityModel} from '../../components/activity/activity-helper';
import {getApi} from '../../components/api/api__instance';
import {loadActivitiesPage} from './arcticle-action';

import type {User, UserAppearanceProfile} from '../../flow/User';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {UITheme} from '../../flow/Theme';
import type {WorkTimeSettings} from '../../flow/WorkTimeSettings';
import type {YouTrackWiki} from '../../flow/Wiki';
import type {Article} from '../../flow/Article';
import type {ActivityItem} from '../../flow/Activity';

type Props = {
  article: Article,
  style: ViewStyleProp,
  uiTheme: UITheme,
};


const getYoutrackWikiProps = (): YouTrackWiki => {
  const api: API = getApi();
  return {
    backendUrl: api.config.backendUrl,
    imageHeaders: api.auth.getAuthorizationHeaders()
  };
};

const ArticleActivities = (props: Props) => {
  const {article, uiTheme} = props;
  const dispatch: Function = useDispatch();

  const activityPage: Array<ActivityItem> = useSelector(store => store.article.activityPage);
  const user: User = useSelector(store => store.app.user);
  const workTimeSettings: WorkTimeSettings = useSelector(store => store.app.workTimeSettings);

  useEffect(() => {
    dispatch(loadActivitiesPage(article.idReadable));
  }, []);

  if (!activityPage) {
    return null;
  }


  const userAppearanceProfile: ?UserAppearanceProfile = user?.profiles?.appearance;
  const naturalCommentsOrder: boolean = userAppearanceProfile ? userAppearanceProfile.naturalCommentsOrder : true;

  const activities = createActivityModel(activityPage, naturalCommentsOrder);

  return (
    <ScrollView style={props.style}>
      <ActivityStream
        activities={activities}
        attachments={article?.attachments}
        issueFields={article?.fields}
        uiTheme={uiTheme}
        workTimeSettings={workTimeSettings}
        youtrackWiki={getYoutrackWikiProps()}
        onReactionSelect={() => {}}
        currentUser={user}
      />
    </ScrollView>
  );
};

export default ArticleActivities;
