/* @flow */
import styles from './comment.styles';
import Wiki from '../../components/wiki/wiki';
import {
  COLOR_EXTRA_LIGHT_GRAY,
  COLOR_FONT_GRAY,
  COLOR_PINK,
  COLOR_PINK_DARK,
  COLOR_BLACK
} from '../../components/variables/variables';

import {View, Text} from 'react-native';
import React, {Component} from 'react';
import Swipeout from 'react-native-swipeout';
import SwipeButton from './comment__swipe-button';
import {relativeDate, getEntityPresentation} from '../issue-formatter/issue-formatter';
import {reply, share, pencil, trash} from '../icon/icon';
import Avatar from '../avatar/avatar';
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
  onDeletePermanently: Function,

  activitiesEnabled: ?boolean,
};

export default class Comment extends Component<Props, void> {
  static defaultProps = {
    onReply: () => {},
    onCopyCommentLink: () => {},
    onEdit: () => {},
    activitiesEnabled: false
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
          backgroundColor={COLOR_EXTRA_LIGHT_GRAY}
          right={this._getCommentActionButtons()}
          sensitivity={30}
          buttonWidth={56}
          autoClose={true}
        >
          {this.props.activitiesEnabled
            ? this._renderComment(comment, attachments)
            : <View style={styles.commentWrapper}>
              <Avatar
                userName={getEntityPresentation(comment.author)}
                size={40}
                source={{uri: comment.author.avatarUrl}}
              />
              <View style={styles.comment}>
                <Text>
                  <Text style={styles.authorName}>
                    {getEntityPresentation(comment.author)}
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
          }
        </Swipeout>
      </View>
    );
  }
}
