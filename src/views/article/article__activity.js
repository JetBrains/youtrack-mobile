/* @flow */

import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import ArticleAddComment from './article__add-comment';
import ArticleActivityStream from './article__activity-stream';
import {createActivityModel} from '../../components/activity/activity-helper';
import {loadActivitiesPage} from './arcticle-actions';

import styles from './article.styles';

import type {ActivityItem} from '../../flow/Activity';
import type {Article} from '../../flow/Article';
import type {UITheme} from '../../flow/Theme';
import type {User, UserAppearanceProfile} from '../../flow/User';
import IssuePermissions from '../../components/issue-permissions/issue-permissions';

type Props = {
  article: Article,
  issuePermissions: ?IssuePermissions,
  renderRefreshControl: (Function) => React$Element<any>,
  uiTheme: UITheme
};


const ArticleActivities = (props: Props) => {
  const {article, uiTheme, renderRefreshControl, issuePermissions} = props;

  const dispatch: Function = useDispatch();

  const activityPage: Array<ActivityItem> = useSelector(store => store.article.activityPage);
  const user: User = useSelector(store => store.app.user);

  const [activities, updateActivityModel] = useState(null);

  const loadActivities: Function = (reset: boolean) => {
    if (article?.idReadable) {
      dispatch(loadActivitiesPage(reset));
    }
  };

  const canComment = (): boolean => !!issuePermissions && issuePermissions.articleCanCommentOn(article);

  useEffect(loadActivities, []);

  useEffect(() => {
    if (activityPage) {
      const userAppearanceProfile: ?UserAppearanceProfile = user?.profiles?.appearance;
      const naturalCommentsOrder: boolean = userAppearanceProfile ? userAppearanceProfile.naturalCommentsOrder : true;
      updateActivityModel(createActivityModel(activityPage, naturalCommentsOrder));
    }
  }, [activityPage]);


  return (
    <>
      <ScrollView
        refreshControl={renderRefreshControl(() => loadActivities(false))}
        contentContainerStyle={styles.articleActivities}
      >
        <ArticleActivityStream
          activities={activities}
          attachments={article?.attachments}
          uiTheme={uiTheme}
          user={user}
        />
      </ScrollView>
      {canComment() && (
        <ArticleAddComment
          issuePermissions={issuePermissions}
          onAdd={() => loadActivities(false)}
          uiTheme={uiTheme}
        />
      )}
    </>
  );
};

export default React.memo<Props>(ArticleActivities);
