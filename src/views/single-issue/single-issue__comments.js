/* @flow */
import styles from './single-issue.styles';
import Comment from '../../components/comment/comment';
import type {IssueComment, Attachment} from '../../flow/CustomFields';

import {View, Text, Image} from 'react-native';
import React, {Component} from 'react';

import {visibility} from '../../components/icon/icon';
import IssuePermissions from '../../components/issue-permissions/issue-permissions';
import {getVisibilityPresentation} from '../../components/issue-formatter/issue-formatter';

type Props = {
  comments: Array<IssueComment>,
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

export default class SingleIssueComments extends Component<Props, void> {
  static defaultProps: DefaultProps = {
    onReply: () => {},
    onCopyCommentLink: () => {}
  };

  _renderCommentsList(comments, attachments) {
    return comments.map(comment => {
      return (
        <View key={comment.id}>
          <Comment
            key={comment.id}
            comment={comment}
            imageHeaders={this.props.imageHeaders}
            backendUrl={this.props.backendUrl}
            onIssueIdTap={this.props.onIssueIdTap}
            attachments={attachments}

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

          {IssuePermissions.isSecured(comment) &&
          <View style={styles.visibility}>
            <Image style={styles.visibilityIcon} source={visibility} />
            <Text style={styles.visibilityText}>{getVisibilityPresentation(comment)}</Text>
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
      <View style={styles.commentsContainer}>
        {comments.length
          ? this._renderCommentsList(reversed, attachments)
          : NoComments}
      </View>
    );
  }
}
