/* @flow */
import styles from './comment.styles';
import Wiki from '../../components/wiki/wiki';
import {COLOR_FONT_GRAY,} from '../../components/variables/variables';

import {View, Text} from 'react-native';
import React, {Component} from 'react';
import {relativeDate, getEntityPresentation} from '../issue-formatter/issue-formatter';
import Avatar from '../avatar/avatar';
import type {IssueComment, Attachment} from '../../flow/CustomFields';

type Props = {
  comment: IssueComment,
  attachments: Array<Attachment>,
  imageHeaders: ?Object,
  backendUrl: string,
  onIssueIdTap: (issueId: string) => any,

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

  _renderDeletedComment() {
    const {
      onRestore,
      onDeletePermanently,
      canRestore,
      canDeletePermanently
    } = this.props;

    return (
      <View>
        <View><Text style={styles.deletedCommentText}>Comment was deleted.</Text></View>

        {Boolean(canRestore || canDeletePermanently) && (
          <View style={styles.actions}>
            <Text>
              {canRestore && (
                <Text
                  onPress={onRestore}
                  style={styles.actionLink}
                >
                  Restore
                </Text>
              )}
              {canDeletePermanently && <Text> or </Text>}
              {canDeletePermanently &&
              <Text
                onPress={onDeletePermanently}
                style={styles.actionLink}
              >
                Delete permanently
              </Text>}
            </Text>
          </View>
        )}

      </View>
    );
  }

  _renderComment(comment, attachments) {
    if (comment.deleted) {
      return this._renderDeletedComment();
    }
    return (
      <View style={styles.commentWikiContainer}>
        <Wiki
          backendUrl={this.props.backendUrl}
          onIssueIdTap={issueId => this.props.onIssueIdTap(issueId)}
          attachments={attachments}
          imageHeaders={this.props.imageHeaders}
        >
          {comment.textPreview || comment.text}
        </Wiki>
      </View>
    );
  }

  render() {
    const {comment, attachments} = this.props;

    return (
      <View>
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
      </View>
    );
  }
}
