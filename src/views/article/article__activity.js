/* @flow */

import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import ArticleActivityStream from './article__activity-stream';
import ArticleAddComment from './article__add-comment';
import ArticleEditComment from './article__activity-edit-comment';
import IssuePermissions from '../../components/issue-permissions/issue-permissions';
import Router from '../../components/router/router';
import {createActivityModel} from '../../components/activity/activity-helper';
import {loadActivitiesPage} from './arcticle-actions';

import styles from './article.styles';

import type {ActivityItem} from '../../flow/Activity';
import type {Article} from '../../flow/Article';
import type {IssueComment} from '../../flow/CustomFields';
import type {UITheme} from '../../flow/Theme';
import type {User, UserAppearanceProfile} from '../../flow/User';

type Props = {
  article: Article,
  issuePermissions: IssuePermissions,
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
          issuePermissions={issuePermissions}
          commentActions={{
            isAuthor: (comment: IssueComment) => issuePermissions.isCurrentUser(comment.author),
            canUpdateComment: (comment: IssueComment) => issuePermissions.articleUpdateComment(article, comment),
            onStartEditing: (comment: Comment) => {
              Router.PageModal({
                children: (
                  <ArticleEditComment
                    comment={comment}
                    uiTheme={uiTheme}
                  />
                )
              });
            }
          }}
        />
      </ScrollView>
      {issuePermissions.articleCanCommentOn(article) && (
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
