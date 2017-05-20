/* @flow */
import styles from './single-issue.styles';
import Comment from '../../components/comment/comment';
import type {IssueComment, Attachment} from '../../flow/CustomFields';

import {View, Text} from 'react-native';
import React, {Component} from 'react';

type Props = {
  comments: Array<IssueComment>,
  attachments: Array<Attachment>,
  imageHeaders: ?Object,
  onReply: (comment: IssueComment) => any,
  onCopyCommentLink: (comment: IssueComment) => any,
  onIssueIdTap: (issueId: string) => any
};

type DefaultProps = {
  onReply: Function,
  onCopyCommentLink: Function,
};

export default class SingleIssueComments extends Component<DefaultProps, Props, void> {
  static defaultProps = {
    onReply: () => {},
    onCopyCommentLink: () => {}
  };

  _renderCommentsList(comments, attachments) {
    return comments.map((comment) => {
      return <Comment key={comment.id}
                      comment={comment}
                      imageHeaders={this.props.imageHeaders}
                      onIssueIdTap={this.props.onIssueIdTap}
                      attachments={attachments}
                      onReply={() => this.props.onReply(comment)}
                      onCopyCommentLink={() => this.props.onCopyCommentLink(comment)}/>;
    });
  }

  render() {
    const {comments, attachments} = this.props;
    const reversed = [...comments].reverse();//reverse to get designed order of comments

    const NoComments = <Text style={{textAlign: 'center'}}>No comments yet</Text>;

    return (<View style={styles.commentsContainer}>
      {comments.length ? this._renderCommentsList(reversed, attachments) : NoComments}
    </View>);
  }
}
