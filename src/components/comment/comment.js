/* @flow */
import styles from './comment.styles';
import Wiki from '../../components/wiki/wiki';
import {COLOR_LIGHT_GRAY, COLOR_FONT_GRAY, COLOR_PINK, COLOR_PINK_DARK, COLOR_BLACK} from '../../components/variables/variables';

import {View, Text, Image} from 'react-native';
import React, {Component} from 'react';
import Swipeout from 'react-native-swipeout';
import SwipeButton from './comment__swipe-button';
import {relativeDate} from '../issue-formatter/issue-formatter';
import {reply, share, pencil} from '../icon/icon';
import type {IssueComment, Attachment} from '../../flow/CustomFields';

type Props = {
  comment: IssueComment,
  attachments: Array<Attachment>,
  imageHeaders: ?Object,
  backendUrl: string,
  onReply: () => any,
  onCopyCommentLink: () => any,
  canEdit: boolean,
  onEdit: () => any,
  onIssueIdTap: (issueId: string) => any
};

export default class Comment extends Component<Props, void> {
  static defaultProps = {
    onReply: () => {
    },
    onCopyCommentLink: () => {
    },
    onEdit: () => {
    }
  };

  _getCommentActionButtons() {
    const {canEdit} = this.props;
    const swipeoutBtns = [
      canEdit && {
        backgroundColor: COLOR_PINK,
        component: <SwipeButton text="Edit" icon={pencil}/>,
        onPress: this.props.onEdit
      }, {
        backgroundColor: COLOR_PINK_DARK,
        component: <SwipeButton text="Reply" icon={reply}/>,
        onPress: this.props.onReply
      }, {
        backgroundColor: COLOR_BLACK,
        component: <SwipeButton text="Copy link" icon={share}/>,
        onPress: this.props.onCopyCommentLink
      }
    ];
    return swipeoutBtns.filter(it => !!it);
  }

  _renderComment(comment, attachments) {
    return (
      <Wiki
        backendUrl={this.props.backendUrl}
        onIssueIdTap={issueId => this.props.onIssueIdTap(issueId)}
        attachments={attachments}
        imageHeaders={this.props.imageHeaders}
      >
        {comment.textPreview}
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
          buttonWidth={56}
          autoClose={true}
        >
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
