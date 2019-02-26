/* @flow */
import styles from './single-issue.styles';
import Comment from '../../components/comment/comment';
import type {Attachment, IssueComment} from '../../flow/CustomFields';

import {View, Text, TouchableOpacity, Platform} from 'react-native';
import React, {Component} from 'react';

import {isActivityCategory} from '../../components/activity/activity__category';

import CommentVisibility from '../../components/comment/comment__visibility';
import IssueVisibility from '../../components/issue-visibility/issue-visibility';

import {getEntityPresentation, relativeDate} from '../../components/issue-formatter/issue-formatter';

import {mergeActivities} from '../../components/activity/activity__merge-activities';
import {groupActivities} from '../../components/activity/activity__group-activities';
import {createActivitiesModel} from '../../components/activity/activity__create-model';

import getHistoryLabel from '../../components/activity/activity__history-label';
import {getTextValueChange} from '../../components/activity/activity__history-value';

import Avatar from '../../components/avatar/avatar';

import Router from '../../components/router/router';

import usage from '../../components/usage/usage';
import log from '../../components/log/log';
import {getApi} from '../../components/api/api__instance';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import ApiHelper from '../../components/api/api__helper';

import {COLOR_FONT_GRAY, UNIT} from '../../components/variables/variables';

const CATEGORY_NAME = 'Issue Stream';

type Props = {
  issueFields: Array<Object>,
  activityPage: Array<Object>,
  attachments: Array<Attachment>,
  imageHeaders: ?Object,
  backendUrl: string,

  canEditComment: (comment: IssueComment) => boolean,
  onStartEditing: (comment: IssueComment) => any,

  canDeleteComment: (comment: IssueComment) => any,
  canRestoreComment: (comment: IssueComment) => any,
  canDeleteCommentPermanently: (comment: IssueComment) => any,
  onDeleteComment: (comment: IssueComment) => any,
  onRestoreComment: (comment: IssueComment) => any,
  onDeleteCommentPermanently: (comment: IssueComment) => any,

  onReply: (comment: IssueComment) => any,
  onCopyCommentLink: (comment: IssueComment) => any,
  onIssueIdTap: (issueId: string) => any
};

type DefaultProps = {
  onReply: Function,
  onCopyCommentLink: Function
};

export default class SingleIssueActivities extends Component<Props, void> {
  static defaultProps: DefaultProps = {
    onReply: () => {},
    onCopyCommentLink: () => {}
  };

  _isMultiValueActivity(activity: Object) {
    if (isActivityCategory.customField(activity)) {
      const field = activity.field;
      return field.customField && field.customField.fieldType && field.customField.fieldType.isMultiValue;
    }

    if (activity.added && activity.added.length > 1 || activity.removed && activity.removed.length > 1) {
      return true;
    }

    return false;
  }

  _renderTextValueChange(activity: Object, timestamp, issueFields: Array<Object>) {
    const isMultiValue = this._isMultiValueActivity(activity);
    const removed = getTextValueChange(activity, issueFields, true);
    const added = getTextValueChange(activity, issueFields);
    return (
      <View key={activity.id}>
        <View style={styles.row}>
          <Text style={{flex: 1}}>
            <Text style={styles.activityLabel}>{getHistoryLabel(activity)}</Text>
            <Text>
              <Text style={isMultiValue || removed && !added ? styles.activityRemoved : null}>
                {removed}
              </Text>
              {Boolean(removed && added) && (isMultiValue ? ', ' :
                <Text style={Platform.OS !== 'ios' && {fontSize: 24}}> {'\u2192'} </Text>)}
              <Text>{added}</Text>
            </Text>
          </Text>
          {this._renderTimestamp(timestamp, styles.alignedRight)}
        </View>

      </View>
    );
  }

  _renderLinkChange(event: Object, timestamp) {
    const linkedIssues = [].concat(event.added).concat(event.removed);
    return (
      <TouchableOpacity key={event.id}>
        <View style={styles.row}>
          <Text style={styles.activityLabel}>{getHistoryLabel(event)}</Text>
          {this._renderTimestamp(timestamp, styles.alignedRight)}
        </View>
        {
          linkedIssues.map((linkedIssue) => (
            <Text key={linkedIssue.id} style={{lineHeight: UNIT * 2.5, marginTop: UNIT / 4}}
              onPress={() => Router.SingleIssue({issueId: linkedIssue.idReadable})}>
              <Text style={[
                styles.linkText,
                linkedIssue.resolved && {color: COLOR_FONT_GRAY},
                linkedIssue.resolved && styles.activityRemoved
              ]}>
                {linkedIssue.idReadable}
              </Text>
              {`  ${ linkedIssue.summary}`}
            </Text>
          ))
        }
      </TouchableOpacity>
    );
  }

  _renderAttachmentChange(event: Object, timestamp) {
    const removed = event.removed || [];
    const added = event.added || [];
    const addedAndLaterRemoved = added.filter(it => !it.url);
    let addedAndAvailable = added.filter(it => it.url);
    const hasAddedAttachments = addedAndAvailable.length > 0;

    if (addedAndAvailable.length) {
      addedAndAvailable = ApiHelper.convertRelativeUrls(addedAndAvailable, 'url', this.props.backendUrl);
    }

    return (
      <View key={event.id}>
        <View style={styles.row}>
          <Text style={[styles.activityLabel, {paddingBottom: UNIT / 2}]}>{getHistoryLabel(event)}</Text>
          {this._renderTimestamp(timestamp, styles.alignedRight)}
        </View>

        {hasAddedAttachments && <AttachmentsRow
          attachments={addedAndAvailable}
          attachingImage={null}
          imageHeaders={getApi().auth.getAuthorizationHeaders()}
          onImageLoadingError={err => log.warn('onImageLoadingError', err.nativeEvent)}
          onOpenAttachment={(type) => (
            usage.trackEvent(CATEGORY_NAME, type === 'image' ? 'Showing image' : 'Open attachment by URL')
          )}
        />}
        {addedAndLaterRemoved.length > 0 && addedAndLaterRemoved.map(it => <Text key={it.id}>{it.name}</Text>)}

        {removed.length > 0 && <Text style={hasAddedAttachments && {marginTop: UNIT / 2}}>{event.removed.map((it, index) =>
          <Text key={it.id}>
            {index > 0 && ', '}
            <Text style={styles.activityRemoved}>{it.name}</Text>
          </Text>
        )}
        </Text>}
      </View>
    );
  }

  _renderComment(comment) {
    return (
      <View key={comment.id}>
        <Comment
          key={comment.id}

          comment={comment}

          imageHeaders={this.props.imageHeaders}
          backendUrl={this.props.backendUrl}

          onIssueIdTap={this.props.onIssueIdTap}

          attachments={comment.attachments}

          canEdit={this.props.canEditComment(comment)}
          onEdit={() => this.props.onStartEditing(comment)}

          canDelete={this.props.canDeleteComment(comment)}
          onDelete={() => this.props.onDeleteComment(comment)}
          canRestore={this.props.canRestoreComment(comment)}
          onRestore={() => this.props.onRestoreComment(comment)}
          canDeletePermanently={this.props.canDeleteCommentPermanently(comment)}
          onDeletePermanently={() => this.props.onDeleteCommentPermanently(comment)}

          onReply={() => this.props.onReply(comment)}
          onCopyCommentLink={() => this.props.onCopyCommentLink(comment)}

          activitiesEnabled={true}
        />

        {!comment.deleted && IssueVisibility.isSecured(comment.visibility) &&
        <CommentVisibility visibility={IssueVisibility.getVisibilityPresentation(comment.visibility)}/>}
      </View>

    );
  }

  _renderActivityByCategory = (activity, timestamp) => {
    let renderedData = null;
    switch (true) {
    case Boolean(
      isActivityCategory.tag(activity) ||
      isActivityCategory.customField(activity) ||
      isActivityCategory.sprint(activity) ||
      isActivityCategory.work(activity)
    ):
      renderedData = this._renderTextValueChange(activity, timestamp, this.props.issueFields);
      break;
    case Boolean(isActivityCategory.link(activity)):
      renderedData = this._renderLinkChange(activity, timestamp);
      break;
    case Boolean(isActivityCategory.attachment(activity)):
      renderedData = this._renderAttachmentChange(activity, timestamp);
      break;
    }
    return renderedData;
  };

  _processActivities(activities) {
    return groupActivities(activities, {
      onAddActivityToGroup: (group, activity) => {
        if (isActivityCategory.issueCreated(activity)) {
          group.hidden = true;
        }
      },
      onCompleteGroup: (group: Object) => {
        group.events = mergeActivities(group.events);
      }
    });
  }

  _renderUserAvatar(activityGroup: Object) {
    return (
      <Avatar
        userName={getEntityPresentation(activityGroup.author)}
        size={40}
        source={{uri: activityGroup.author.avatarUrl}}
      />
    );
  }

  _renderTimestamp(timestamp, style) {
    if (timestamp) {
      return (
        <Text style={[styles.activityTimestamp, style]}>
          {' '}{relativeDate(timestamp)}
        </Text>
      );
    }
  }

  _renderUserInfo(activityGroup: Object) {
    return (
      <View style={[styles.row, styles.activityAuthor]}>
        <Text style={styles.activityAuthorName}>
          {getEntityPresentation(activityGroup.author)}
        </Text>
        <Text style={styles.alignedRight}>{this._renderTimestamp(activityGroup.timestamp)}</Text>
      </View>
    );
  }

  render() {
    const {activityPage} = this.props;
    const groupedActivities = this._processActivities(activityPage);
    const activities = createActivitiesModel(groupedActivities);

    return (
      <View>
        {activities.length
          ? activities.map((activityGroup, index) => {
            if (activityGroup.hidden) {
              return null;
            }

            return (
              <View key={`${activityGroup.timestamp}-${index}`} style={[
                styles.activity,
                index === 0 && styles.activityFirstItem,
                activityGroup.merged ? styles.mergedActivity : null
              ]}>
                {!activityGroup.merged && this._renderUserAvatar(activityGroup)}

                <View style={styles.activityItem}>
                  {!activityGroup.merged && this._renderUserInfo(activityGroup)}

                  <View>
                    <View
                      style={styles.activityChange}>{activityGroup.comment ? this._renderComment(activityGroup.comment.added[0]) : null}</View>

                    {activityGroup.events.length > 0 &&
                    <View style={activityGroup.comment ? styles.activityRelatedChanges : styles.activityHistoryChanges}>
                      {activityGroup.events.map((event) => (
                        <View key={event.id} style={styles.activityChange}>
                          {this._renderActivityByCategory(event, activityGroup.merged && activityGroup.timestamp)}
                        </View>
                      ))}
                    </View>}
                  </View>

                </View>

              </View>
            );
          })
          : <Text style={[styles.activityChange, {textAlign: 'center', marginTop: UNIT * 5}]}>No activity yet</Text>}
      </View>
    );
  }
}
