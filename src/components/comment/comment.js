/* @flow */
import styles from './comment.styles';
import Wiki from '../../components/wiki/wiki';
import {
  COLOR_LIGHT_GRAY,
  COLOR_FONT_GRAY,
  COLOR_PINK,
  COLOR_PINK_DARK,
  COLOR_BLACK
} from '../../components/variables/variables';

import {View, Text, Image} from 'react-native';
import React, {Component} from 'react';
import Swipeout from 'react-native-swipeout';
import SwipeButton from './comment__swipe-button';
import {relativeDate} from '../issue-formatter/issue-formatter';
import {reply, share, pencil, trash} from '../icon/icon';
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
  onIssueIdTap: (issueId: string) => any,

  canDelete: boolean,
  onDelete: () => any,
  canRestore: boolean,
  onRestore: Function,
  canDeletePermanently: boolean,
  onDeletePermanently: Function
};

export default class Comment extends Component<Props, void> {
  static defaultProps = {
    onReply: () => {},
    onCopyCommentLink: () => {},
    onEdit: () => {}
  };

  _getCommentActionButtons() {
    const {canEdit, canDelete} = this.props;
    const swipeoutBtns = [
      {
        backgroundColor: COLOR_PINK,
        component: <SwipeButton text="Reply" icon={reply} />,
        onPress: this.props.onReply
      },
      {
        backgroundColor: COLOR_PINK_DARK,
        component: <SwipeButton text="Copy link" icon={share} />,
        onPress: this.props.onCopyCommentLink
      },
      canEdit && {
        backgroundColor: COLOR_BLACK,
        component: <SwipeButton text="Edit" icon={pencil} />,
        onPress: this.props.onEdit
      },

      canDelete && {
        backgroundColor: COLOR_BLACK,
        component: <SwipeButton text="Delete" icon={trash} />,
        onPress: this.props.onDelete
      }
    ];
    return swipeoutBtns.filter(it => !!it);
  }

  _renderDeletedComment() {
    const {
      onRestore,
      onDeletePermanently,
      canRestore,
      canDeletePermanently
    } = this.props;

    return (
      <View>
        <Text style={styles.deletedCommentText}>
          <Text>Comment was deleted. </Text>
          {canRestore &&
            <Text onPress={onRestore} style={styles.actionLink}>
              Restore
            </Text>}
          {canDeletePermanently && <Text> or </Text>}
          {canDeletePermanently &&
            <Text onPress={onDeletePermanently} style={styles.actionLink}>
              Delete permanently
            </Text>}
        </Text>
      </View>
    );
  }

  _renderComment(comment, attachments) {
    if (comment.deleted) {
      return this._renderDeletedComment();
    }
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
          disabled={comment.deleted}
          backgroundColor={COLOR_LIGHT_GRAY}
          right={comment.deleted ? null : this._getCommentActionButtons()}
          sensitivity={30}
          buttonWidth={56}
          autoClose={true}
        >
          <View style={styles.commentWrapper}>
            <Image
              style={styles.avatar}
              source={{uri: comment.author.avatarUrl}}
            />
            <View style={styles.comment}>
              <Text>
                <Text style={styles.authorName}>
                  {comment.author.fullName || comment.author.login}
                </Text>
                <Text style={{color: COLOR_FONT_GRAY}}>
                  {' '}{relativeDate(comment.created)}
                </Text>
              </Text>
              <View style={styles.commentText}>
                {this._renderComment(comment, attachments)}
              </View>
            </View>
          </View>
        </Swipeout>
      </View>
    );
  }
}
