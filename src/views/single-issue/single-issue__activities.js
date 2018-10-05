/* @flow */
import styles from './single-issue.styles';
import Comment from '../../components/comment/comment';
import type {Attachment, IssueComment} from '../../flow/CustomFields';

import {View, Text} from 'react-native';
import React, {Component} from 'react';

import {activityCategory} from '../../components/activity/activity__category';

import CommentVisibility from '../../components/comment/comment__visibility';
import IssueVisibility from '../../components/issue-visibility/issue-visibility';


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

export default class SingleIssueActivityPage extends Component<Props, void> {
  static defaultProps: DefaultProps = {
    onReply: () => {},
    onCopyCommentLink: () => {}
  };

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
        />

        {!comment.deleted && IssueVisibility.isSecured(comment.visibility) &&
        <CommentVisibility visibility={IssueVisibility.getVisibilityPresentation(comment.visibility)}/>}
      </View>

    );
  }

  _renderActivities(activities) {
    return activities.map(activity => {
      return activity.added.map(item => {
        if (activity.category.id === activityCategory.COMMENT) {
          return this._renderComment(item);
        }
      });
    });
  }

  render() {
    const {activityPage} = this.props;

    const NoActivity = (
      <Text style={{textAlign: 'center'}}>No activity yet</Text>
    );

    return (
      <View style={styles.commentsContainer}>
        {activityPage.length
          ? this._renderActivities(activityPage)
          : NoActivity}
      </View>
    );
  }
}
