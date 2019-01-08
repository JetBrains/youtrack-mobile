/* @flow */
import styles from './single-issue.styles';
import Comment from '../../components/comment/comment';
import type {Attachment, IssueComment} from '../../flow/CustomFields';

import {View, Text} from 'react-native';
import React, {Component} from 'react';

import {isActivityCategory} from '../../components/activity/activity__category';

import CommentVisibility from '../../components/comment/comment__visibility';
import IssueVisibility from '../../components/issue-visibility/issue-visibility';

import {getEntityPresentation, relativeDate} from '../../components/issue-formatter/issue-formatter';

import {mergeActivities} from '../../components/activity/activity__merge-activities';
import {groupActivities} from '../../components/activity/activity__group-activities';
import {createActivitiesModel} from '../../components/activity/activity__create-model';

import getActivityHistoryLabel from '../../components/activity/activity__history-label';
import getActivityHistorySingleValue from '../../components/activity/activity__history-single-value';

import Avatar from '../../components/avatar/avatar';

type Props = {
  activityPage: Array<Object>,
  attachments: Array<Attachment>,
  imageHeaders: ?Object,
  backendUrl: string,

  canEditComment: (comment: IssueComment) => boolean,
  onStartEditing: (comment: IssueComment) => any,

  canDeleteComment: (comment: IssueComment) => any,
  canRestoreComment: (comment: IssueComment) => any,
  canDeleteCommentPermanently: (comment: IssueComment) => any,
  onDeleteComment: (comment: IssueComment) => any,
  onRestoreComment: (comment: IssueComment) => any,
  onDeleteCommentPermanently: (comment: IssueComment) => any,

  onReply: (comment: IssueComment) => any,
  onCopyCommentLink: (comment: IssueComment) => any,
  onIssueIdTap: (issueId: string) => any
};

type DefaultProps = {
  onReply: Function,
  onCopyCommentLink: Function
};

export default class SingleIssueActivities extends Component<Props, void> {
  static defaultProps: DefaultProps = {
    onReply: () => {},
    onCopyCommentLink: () => {}
  };

  static getRelativeDatePresentation(timestamp: Date) {
    return relativeDate(timestamp);
  }

  static renderSingleValueHistoryChange(activity: Object) {
    const removed = getActivityHistorySingleValue(activity, true);
    const added = getActivityHistorySingleValue(activity);
    return (
      <Text key={activity.id} style={styles.activityHistory}>
        {getActivityHistoryLabel(activity)}

        <Text style={removed && !added ? styles.activityRemoved : null}>
          {removed}
        </Text>
        {removed && added ? <Text> ⟶ </Text> : null}
        {added}
      </Text>
    );
  }

  _renderComment(comment) {
    return (
      <View key={comment.id}>
        <Comment
          key={comment.id}

          comment={comment}

          imageHeaders={this.props.imageHeaders}
          backendUrl={this.props.backendUrl}

          onIssueIdTap={this.props.onIssueIdTap}

          attachments={comment.attachments}

          canEdit={this.props.canEditComment(comment)}
          onEdit={() => this.props.onStartEditing(comment)}

          canDelete={this.props.canDeleteComment(comment)}
          onDelete={() => this.props.onDeleteComment(comment)}
          canRestore={this.props.canRestoreComment(comment)}
          onRestore={() => this.props.onRestoreComment(comment)}
          canDeletePermanently={this.props.canDeleteCommentPermanently(comment)}
          onDeletePermanently={() => this.props.onDeleteCommentPermanently(comment)}

          onReply={() => this.props.onReply(comment)}
          onCopyCommentLink={() => this.props.onCopyCommentLink(comment)}

          activitiesEnabled={true}
        />

        {!comment.deleted && IssueVisibility.isSecured(comment.visibility) &&
        <CommentVisibility visibility={IssueVisibility.getVisibilityPresentation(comment.visibility)}/>}
      </View>

    );
  }

  _renderActivityByCategory = (activity) => {
    if (isActivityCategory.attachment(activity) || isActivityCategory.tag(activity) ||
      isActivityCategory.customField(activity)) {
      return SingleIssueActivities.renderSingleValueHistoryChange(activity);
    }
  };

  _processActivities(activities) {
    return groupActivities(activities, {
      onAddActivityToGroup: (group, activity) => {
        if (isActivityCategory.issueCreated(activity)) {
          group.hidden = true;
        }
      },
      onCompleteGroup: (group: Object) => {
        group.events = mergeActivities(group.events);
      }
    });
  }

  render() {
    const {activityPage} = this.props;
    const groupedActivities = this._processActivities(activityPage);
    const activities = createActivitiesModel(groupedActivities);

    return (
      <View style={styles.activityContainer}>
        {activities.length
          ? activities.map((activityGroup, index) => {
            if (activityGroup.hidden) {
              return null;
            }

            return (
              <View key={activityGroup.timestamp + index} style={styles.activityWrapper}>
                <Avatar
                  userName={getEntityPresentation(activityGroup.author)}
                  size={40}
                  source={{uri: activityGroup.author.avatarUrl}}
                />

                <View style={styles.activity}>
                  <Text>
                    <Text style={styles.authorName}>
                      {getEntityPresentation(activityGroup.author)}
                    </Text>
                    {activityGroup.comment
                      ? <Text style={styles.activityHistory}>
                        {' '}{SingleIssueActivities.getRelativeDatePresentation(activityGroup.timestamp)}
                      </Text>
                      : null
                    }
                  </Text>

                  <View style={styles.activityContent}>
                    {activityGroup.comment ? this._renderComment(activityGroup.comment.added[0]) : null}

                    {activityGroup.events.length
                      ? <View style={activityGroup.comment ? styles.activityRelatedChanges : null}>
                        {activityGroup.events.map(this._renderActivityByCategory)}
                      </View>
                      : null
                    }
                  </View>
                </View>

              </View>
            );
          })
          : <Text style={{textAlign: 'center'}}>No activity yet</Text>}
      </View>
    );
  }
}
