import styles from './single-issue.styles';
import Avatar from '../../components/avatar/avatar';
import relativeDate from 'relative-date';
import TextWithImages from '../../components/text-with-images/text-with-images';

import React, {View, Text} from 'react-native';

export default class SingleIssueComments extends React.Component {

  _renderComment(comment, attachments) {
    return TextWithImages.renderView(comment.text, attachments);
  }

  _renderCommentsList(comments, attachments) {
    return comments.map((comment) => {
      return (
        <View key={comment.id} style={styles.commentWrapper}>
          <Avatar style={styles.avatar} api={this.props.api} userRingId={comment.author.ringId}/>
          <View style={styles.comment}>
            <Text>
              <Text style={{color: '#1CAFE4'}}>{comment.author.name || comment.author.login}</Text>
              <Text style={{color: '#888'}}> {relativeDate(comment.created)} [todo] No date in comment</Text>
            </Text>
            <View style={styles.commentText}>{this._renderComment(comment, attachments)}</View>
          </View>
        </View>
      );
    });
  }

  render() {
    let comments = this.props.comments;
    comments = comments.reduceRight((val, item) => val.concat([item]), []); //reverse to get designed order of comments

    let NoComments = <Text style={{textAlign: 'center'}}>No comments yet</Text>;

    return (<View style={styles.commentsContainer}>
      {comments.length ? this._renderCommentsList(comments, this.props.attachments) : NoComments}
    </View>);
  }
}
