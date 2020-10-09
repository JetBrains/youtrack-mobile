/* @flow */

import {View, Text} from 'react-native';

import React, {Component} from 'react';

import YoutrackWiki from '../wiki/youtrack-wiki';
import Avatar from '../avatar/avatar';
import MarkdownView from '../wiki/markdown-view';
import {relativeDate, getEntityPresentation} from '../issue-formatter/issue-formatter';

import styles from './comment.styles';

import type {IssueComment, Attachment} from '../../flow/CustomFields';
import type {YouTrackWiki} from '../../flow/Wiki';
import type {UITheme} from '../../flow/Theme';

type Props = {
  comment: IssueComment,
  attachments: Array<Attachment>,

  youtrackWiki: YouTrackWiki,

  canRestore: boolean,
  onRestore: Function,
  canDeletePermanently: boolean,
  onDeletePermanently: Function,

  activitiesEnabled: ?boolean,

  uiTheme: UITheme
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

    if (comment.usesMarkdown) {
      return (
        <MarkdownView
          attachments={attachments}
          uiTheme={this.props.uiTheme}
        >
          {comment.text}
        </MarkdownView>
      );
    }

    const {backendUrl, onIssueIdTap, imageHeaders} = this.props.youtrackWiki;

    return (
      <View style={styles.commentWikiContainer}>
        <YoutrackWiki
          backendUrl={backendUrl}
          onIssueIdTap={issueId => onIssueIdTap(issueId)}
          attachments={attachments}
          imageHeaders={imageHeaders}
          uiTheme={this.props.uiTheme}
        >
          {comment.textPreview}
        </YoutrackWiki>
      </View>
    );
  }

  render() {
    const {comment, attachments, uiTheme} = this.props;

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
                <Text style={{color: uiTheme.colors.$icon}}>
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
