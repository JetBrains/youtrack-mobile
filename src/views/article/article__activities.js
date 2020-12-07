/* @flow */

import React, {useEffect} from 'react';
import {ScrollView} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import API from '../../components/api/api';
import {ActivityStream} from '../../components/activity/activity__stream';
import {createActivityModel} from '../../components/activity/activity-helper';
import {getApi} from '../../components/api/api__instance';
import {loadActivitiesPage} from './arcticle-action';

import styles from './article.styles';

import type {User, UserAppearanceProfile} from '../../flow/User';
import type {UITheme} from '../../flow/Theme';
import type {WorkTimeSettings} from '../../flow/WorkTimeSettings';
import type {YouTrackWiki} from '../../flow/Wiki';
import type {Article} from '../../flow/Article';
import type {ActivityItem} from '../../flow/Activity';

type Props = {
  article: Article,
  renderRefreshControl: (Function) => React$Element<any>,
  uiTheme: UITheme
};


const getYoutrackWikiProps = (): YouTrackWiki => {
  const api: API = getApi();
  return {
    backendUrl: api.config.backendUrl,
    imageHeaders: api.auth.getAuthorizationHeaders()
  };
};

const ArticleActivities = (props: Props) => {
  const {article, uiTheme, renderRefreshControl} = props;
  const dispatch: Function = useDispatch();

  const activityPage: Array<ActivityItem> = useSelector(store => store.article.activityPage);
  const user: User = useSelector(store => store.app.user);
  const workTimeSettings: WorkTimeSettings = useSelector(store => store.app.workTimeSettings);

  const loadActivities: Function = (reset: boolean) => {
    if (article?.idReadable) {
      dispatch(loadActivitiesPage(article.idReadable, reset));
    }
  };

  useEffect(loadActivities, []);


  const userAppearanceProfile: ?UserAppearanceProfile = user?.profiles?.appearance;
  const naturalCommentsOrder: boolean = userAppearanceProfile ? userAppearanceProfile.naturalCommentsOrder : true;

  return (
    <ScrollView
      refreshControl={renderRefreshControl(() => loadActivities(false))}
      contentContainerStyle={styles.articleActivities}
    >
      <ActivityStream
        activities={createActivityModel(activityPage, naturalCommentsOrder)}
        attachments={article?.attachments}
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
