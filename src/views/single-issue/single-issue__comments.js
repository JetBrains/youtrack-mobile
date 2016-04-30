import styles from './single-issue.styles';
import relativeDate from 'relative-date';
import Wiki, {replaceImageNamesWithUrls} from '../../components/wiki/wiki';
import {COLOR_FONT_GRAY} from '../../components/variables/variables';

import React, {View, Text, Image} from 'react-native';

export default class SingleIssueComments extends React.Component {

  _renderComment(comment, attachments) {
    return <Wiki>{replaceImageNamesWithUrls(comment.text, attachments)}</Wiki>;
  }

  _renderCommentsList(comments, attachments) {
    return comments.map((comment) => {
      return (
        <View key={comment.id} style={styles.commentWrapper}>
          <Image style={styles.avatar} source={{uri: comment.author.avatarUrl}}/>
          <View style={styles.comment}>
            <Text>
              <Text style={{color: '#1CAFE4'}}>{comment.author.fullName || comment.author.login}</Text>
              <Text style={{color: COLOR_FONT_GRAY}}> {relativeDate(comment.created)}</Text>
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
