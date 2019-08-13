/* @flow */
import Comment from '../../components/comment/comment';
import type {IssueComment, Attachment} from '../../flow/CustomFields';

import {View, Text} from 'react-native';
import React, {Component} from 'react';

import CommentVisibility from '../../components/comment/comment__visibility';
import IssueVisibility from '../../components/issue-visibility/issue-visibility';

import {UNIT} from '../../components/variables/variables';
import CommentActions from '../../components/comment/comment__actions';

import styles from './single-issue__comments.styles';

type Props = {
  comments: Array<IssueComment>,
  attachments: Array<Attachment>,
  imageHeaders: ?Object,
  backendUrl: string,

  canUpdateComment: (comment: IssueComment) => boolean,
  onStartEditing: (comment: IssueComment) => any,

  canDeleteComment: (comment: IssueComment) => any,
  canRestoreComment: (comment: IssueComment) => any,
  canDeleteCommentPermanently: (comment: IssueComment) => any,
  onDeleteComment: (comment: IssueComment) => any,
  onRestoreComment: (comment: IssueComment) => any,
  onDeleteCommentPermanently: (comment: IssueComment) => any,

  onReply: (comment: IssueComment) => any,
  onCopyCommentLink: (comment: IssueComment) => any,
  onIssueIdTap: (issueId: string) => any,

  activitiesEnabled: boolean
};

type DefaultProps = {
  onReply: Function,
  onCopyCommentLink: Function,
  activitiesEnabled: boolean
};

export default class SingleIssueComments extends Component<Props, void> {
  static defaultProps: DefaultProps = {
    onReply: () => {},
    onCopyCommentLink: () => {},
    activitiesEnabled: false
  };

  _renderCommentsList(comments, attachments) {
    const visibilityStyles = !this.props.activitiesEnabled && {paddingLeft: UNIT * 7};
    return comments.map(comment => {
      return (
        <View key={comment.id}>
          <CommentActions
            onReply={() => this.props.onReply(comment)}
            onCopyCommentLink={() => this.props.onCopyCommentLink(comment)}
            canEdit={this.props.canUpdateComment(comment)}
            onEdit={() => this.props.onStartEditing(comment)}
            canDelete={this.props.canDeleteComment(comment)}
            onDelete={() => this.props.onDeleteComment(comment)}
            disabled={comment.deleted}
          >
            <Comment
              key={comment.id}
              comment={comment}
              imageHeaders={this.props.imageHeaders}
              backendUrl={this.props.backendUrl}
              onIssueIdTap={this.props.onIssueIdTap}
              attachments={attachments}

              canRestore={this.props.canRestoreComment(comment)}
              onRestore={() => this.props.onRestoreComment(comment)}
              canDeletePermanently={this.props.canDeleteCommentPermanently(comment)}
              onDeletePermanently={() => this.props.onDeleteCommentPermanently(comment)}

              activitiesEnabled={this.props.activitiesEnabled}
            />
          </CommentActions>

          {IssueVisibility.isSecured(comment.visibility) &&
          <View style={visibilityStyles}>
            <CommentVisibility visibility={IssueVisibility.getVisibilityPresentation(comment.visibility)}/>
          </View>
          }
        </View>
      );
    });
  }

  render() {
    const {comments, attachments} = this.props;
    const reversed = [...comments].reverse(); //reverse to get designed order of comments

    const NoComments = (
      <Text style={{textAlign: 'center'}}>No comments yet</Text>
    );

    return (
      <View style={styles.commentListContainer}>
        {comments.length
          ? this._renderCommentsList(reversed, attachments)
          : NoComments}
      </View>
    );
  }
}
