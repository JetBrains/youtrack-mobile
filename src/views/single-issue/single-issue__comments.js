import styles from './single-issue.styles';
import Comment from '../../components/comment/comment';


import {View, Text} from 'react-native';
import React from 'react';

export default class SingleIssueComments extends React.Component {
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
    let comments = this.props.comments;
    comments = comments.reduceRight((val, item) => val.concat([item]), []); //reverse to get designed order of comments

    const NoComments = <Text style={{textAlign: 'center'}}>No comments yet</Text>;

    return (<View style={styles.commentsContainer}>
      {comments.length ? this._renderCommentsList(comments, this.props.attachments) : NoComments}
    </View>);
  }
}
