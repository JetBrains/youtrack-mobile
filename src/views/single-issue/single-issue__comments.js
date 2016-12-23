/* @flow */
import styles from './single-issue.styles';
import Comment from '../../components/comment/comment';


import {View, Text} from 'react-native';
import React, {Component} from 'react';

type Props = {
  comments: Array<IssueComment>,
  attachments: Array<Attachment>,
  onReply: () => any,
  onCopyCommentLink: () => any,
  onIssueIdTap: () => any
};

export default class SingleIssueComments extends Component {
  props: Props;

  static defaultProps = {
    onReply: () => {
    },
    onCopyCommentLink: () => {
    }
  };

  _renderCommentsList(comments, attachments) {
    return comments.map((comment) => {
      return <Comment key={comment.id}
                      comment={comment}
                      onIssueIdTap={this.props.onIssueIdTap}
                      attachments={attachments}
                      onReply={() => this.props.onReply(comment)}
                      onCopyCommentLink={() => this.props.onCopyCommentLink(comment)}/>;
    });
  }

  render() {
    const {comments, attachments} = this.props;
    comments.reverse();//reverse to get designed order of comments

    const NoComments = <Text style={{textAlign: 'center'}}>No comments yet</Text>;

    return (<View style={styles.commentsContainer}>
      {comments.length ? this._renderCommentsList(comments, attachments) : NoComments}
    </View>);
  }
}
