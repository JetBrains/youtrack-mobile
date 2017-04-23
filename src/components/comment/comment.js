/* @flow */
import styles from './comment.styles';
import Wiki, {decorateRawText} from '../../components/wiki/wiki';
import {COLOR_LIGHT_GRAY, COLOR_FONT_GRAY, COLOR_PINK} from '../../components/variables/variables';

import {View, Text, Image} from 'react-native';
import React from 'react';
import Swipeout from 'react-native-swipeout';
import SwipeButton from './comment__swipe-button';
import {relativeDate} from '../issue-formatter/issue-formatter';
import {reply, share} from '../icon/icon';
import type {IssueComment, Attachment} from '../../flow/CustomFields';

type Props = {
  comment: IssueComment,
  attachments: Array<Attachment>,
  imageHeaders: ?Object,
  onReply: () => any,
  onCopyCommentLink: () => any,
  onIssueIdTap: (issueId: string) => any
};

export default class Comment extends React.Component {
  props: Props;

  static defaultProps = {
    onReply: () => {
    },
    onCopyCommentLink: () => {
    }
  };

  _getCommentActionButtons() {
    const swipeoutBtns = [
      {
        backgroundColor: COLOR_PINK,
        component: <SwipeButton text="Reply" icon={reply}/>,
        onPress: this.props.onReply
      }, {
        backgroundColor: '#000',
        component: <SwipeButton text="Copy link" icon={share}/>,
        onPress: this.props.onCopyCommentLink
      }
    ];
    return swipeoutBtns;
  }

  _renderComment(comment, attachments) {
    return (
      <Wiki
        onIssueIdTap={issueId => this.props.onIssueIdTap(issueId)}
        attachments={attachments}
        imageHeaders={this.props.imageHeaders}
      >
        {decorateRawText(comment.text, comment.textPreview, attachments)}
      </Wiki>
    );
  }

  render() {
    const {comment, attachments} = this.props;

    return (
      <View>
        <Swipeout
          key={comment.id}
          backgroundColor={COLOR_LIGHT_GRAY}
          right={this._getCommentActionButtons()}
          sensitivity={30}
          autoClose={true}>
          <View style={styles.commentWrapper}>
            <Image style={styles.avatar} source={{uri: comment.author.avatarUrl}}/>
            <View style={styles.comment}>
              <Text>
                <Text style={styles.authorName}>{comment.author.fullName || comment.author.login}</Text>
                <Text style={{color: COLOR_FONT_GRAY}}> {relativeDate(comment.created)}</Text>
              </Text>
              <View style={styles.commentText}>{this._renderComment(comment, attachments)}</View>
            </View>
          </View>
        </Swipeout>
      </View>
    );
  }
}
