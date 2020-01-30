/* @flow */
import styles from './single-issue.styles';
import Comment from '../../components/comment/comment';
import type {Attachment, IssueComment} from '../../flow/CustomFields';

import {View, Text, TouchableOpacity, Image} from 'react-native';
import React, {PureComponent} from 'react';

import {isActivityCategory} from '../../components/activity/activity__category';

import CommentVisibility from '../../components/comment/comment__visibility';
import IssueVisibility from '../../components/issue-visibility/issue-visibility';
import CommentActions from '../../components/comment/comment__actions';

import {getEntityPresentation, relativeDate, absDate} from '../../components/issue-formatter/issue-formatter';

import {mergeActivities} from '../../components/activity/activity__merge-activities';
import {groupActivities} from '../../components/activity/activity__group-activities';
import {createActivitiesModel} from '../../components/activity/activity__create-model';

import getEventTitle from '../../components/activity/activity__history-title';
import {getTextValueChange} from '../../components/activity/activity__history-value';
import {minutesAndHoursFor} from '../../components/time-tracking/time-tracking';

import Avatar from '../../components/avatar/avatar';

import Router from '../../components/router/router';

import {history, work} from '../../components/icon/icon';

import usage from '../../components/usage/usage';
import log from '../../components/log/log';
import {getApi} from '../../components/api/api__instance';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import ApiHelper from '../../components/api/api__helper';
import CustomFieldChangeDelimiter from '../../components/custom-field/custom-field__change-delimiter';

import type {WorkTimeSettings} from '../../flow/WorkTimeSettings';
import type {ActivityItem, IssueActivity} from '../../flow/Activity';

import {COLOR_FONT, COLOR_FONT_GRAY, UNIT} from '../../components/variables/variables';
import Diff from '../../components/diff/diff';

const CATEGORY_NAME = 'Issue Stream';

type Props = {
  issueFields: Array<Object>,
  activityPage: ?Array<IssueActivity>,
  attachments: Array<Attachment>,
  imageHeaders: ?Object,
  backendUrl: string,

  canUpdateComment: (comment: IssueComment) => boolean,
  onStartEditing: (comment: IssueComment) => any,

  canDeleteComment: (comment: IssueComment) => any,
  canRestoreComment: (comment: IssueComment) => any,
  canDeleteCommentPermanently: (comment: IssueComment) => any,
  onDeleteComment: (comment: IssueComment) => any,
  onRestoreComment: (comment: IssueComment) => any,
  onDeleteCommentPermanently: (comment: IssueComment, activityId?: string) => any,

  onReply: (comment: IssueComment) => any,
  onCopyCommentLink: (comment: IssueComment) => any,
  onIssueIdTap: (issueId: string) => any,

  workTimeSettings: ?WorkTimeSettings,
  naturalCommentsOrder: boolean,
};

type DefaultProps = {
  onReply: Function,
  onCopyCommentLink: Function,
  workTimeSettings: WorkTimeSettings,
  naturalCommentsOrder: boolean
};

type Change = {
  added: ActivityItem,
  removed: ActivityItem
};

export default class SingleIssueActivities extends PureComponent<Props, void> {
  static defaultProps: DefaultProps = {
    onReply: () => {
    },
    onCopyCommentLink: () => {
    },
    workTimeSettings: {},
    naturalCommentsOrder: true
  };

  _isMultiValueActivity(activity: Object) {
    if (isActivityCategory.customField(activity)) {
      const field = activity.field;
      if (!field) {
        return false;
      }
      return field.customField && field.customField.fieldType && field.customField.fieldType.isMultiValue;
    }

    if (activity.added && activity.added.length > 1 || activity.removed && activity.removed.length > 1) {
      return true;
    }

    return false;
  }

  getTextChange(activity: IssueActivity, issueFields: Array<Object>): Change {
    const getParams = (isRemovedValue) => ({
      activity,
      issueFields,
      workTimeSettings: this.props.workTimeSettings,
      isRemovedValue: isRemovedValue
    });

    return {
      added: getTextValueChange(getParams(false)),
      removed: getTextValueChange(getParams(true))
    };
  }

  renderTextDiff(activity: IssueActivity, textChange: Change) {
    return <Diff
      title={getEventTitle(activity, true)}
      text1={textChange.removed}
      text2={textChange.added}
    />;
  }

  renderTextChange(activity: IssueActivity, textChange: Change) {
    const isMultiValue = this._isMultiValueActivity(activity);
    return (
      <Text>
        <Text style={styles.activityLabel}>{getEventTitle(activity)}</Text>

        <Text
          style={[
            styles.activityText,
            isMultiValue || textChange.removed && !textChange.added ? styles.activityRemoved : null
          ]}
        >
          {textChange.removed}
        </Text>

        {Boolean(textChange.removed && textChange.added) && (
          <Text style={styles.activityText}>
            {isMultiValue ? ', ' : CustomFieldChangeDelimiter}
          </Text>
        )}

        <Text style={styles.activityText}>{textChange.added}</Text>
      </Text>
    );
  }

  renderTextValueChange(activity: IssueActivity, issueFields: Array<Object>) {
    const textChange = this.getTextChange(activity, issueFields);
    const isTextDiff = (
      isActivityCategory.description(activity) ||
      isActivityCategory.summary(activity)
    );

    return (
      <View style={styles.row}>
        <View style={{flexGrow: 2}}>
          {isTextDiff && this.renderTextDiff(activity, textChange)}
          {!isTextDiff && this.renderTextChange(activity, textChange)}
        </View>
      </View>
    );
  }

  _renderLinkChange(event: Object) {
    const linkedIssues = [].concat(event.added).concat(event.removed);
    return (
      <TouchableOpacity key={event.id}>
        <View style={styles.row}>
          <Text style={styles.activityLabel}>{getEventTitle(event)}</Text>
        </View>
        {
          linkedIssues.map((linkedIssue) => (
            <Text
              key={linkedIssue.id}
              style={{
                lineHeight: UNIT * 2.5,
                marginTop: UNIT / 4
              }}
              onPress={() => Router.SingleIssue({issueId: linkedIssue.idReadable})}>
              <Text style={[
                styles.linkText,
                linkedIssue.resolved && {color: COLOR_FONT_GRAY},
                linkedIssue.resolved && styles.activityRemoved
              ]}>
                {linkedIssue.idReadable}
              </Text>
              {`  ${linkedIssue.summary}`}
            </Text>
          ))
        }
      </TouchableOpacity>
    );
  }

  updateToAbsUrl(attachments: Array<Attachment> = []): Array<Attachment> {
    if (attachments.length) {
      ['url', 'thumbnailURL'].forEach(
        fieldName => (attachments = ApiHelper.convertRelativeUrls(attachments, fieldName, this.props.backendUrl)
        )
      );
    }
    return attachments;
  }

  _renderAttachmentChange(event: Object) {
    const removed = event.removed || [];
    const added = event.added || [];
    const addedAndLaterRemoved = added.filter(it => !it.url);
    const addedAndAvailable = this.updateToAbsUrl(added.filter(it => it.url));
    const hasAddedAttachments = addedAndAvailable.length > 0;

    return (
      <View key={event.id}>
        <View style={styles.row}>
          <Text style={[styles.activityLabel, {paddingBottom: UNIT / 2}]}>{getEventTitle(event)}</Text>
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

        {removed.length > 0 &&
        <Text style={hasAddedAttachments && {marginTop: UNIT / 2}}>{event.removed.map((it, index) =>
          <Text key={it.id}>
            {index > 0 && ', '}
            <Text style={styles.activityRemoved}>{it.name}</Text>
          </Text>
        )}
        </Text>}
      </View>
    );
  }

  _processActivities(activities: Array<IssueActivity>) {
    return groupActivities(activities, {
      onAddActivityToGroup: (group, activity: IssueActivity) => {
        if (isActivityCategory.issueCreated(activity)) {
          group.hidden = true;
        }
      },
      onCompleteGroup: (group: Object) => {
        group.events = mergeActivities(group.events);
      }
    });
  }

  _renderUserAvatar(activityGroup: Object, showAvatar: boolean) {
    if (showAvatar) {
      return (
        <Avatar
          userName={getEntityPresentation(activityGroup.author)}
          size={40}
          source={{uri: activityGroup.author.avatarUrl}}
        />
      );
    }
    return (
      <Image source={activityGroup.work ? work : history} style={styles.activityHistoryIcon}/>
    );
  }

  _renderTimestamp(timestamp, style) {
    if (timestamp) {
      return (
        <Text style={[styles.activityTimestamp, style]}>
          {relativeDate(timestamp)}
        </Text>
      );
    }
  }

  _renderUserInfo(activityGroup: Object, noTimestamp?: boolean) {
    return (
      <View style={[styles.activityAuthor]}>
        <Text style={styles.activityAuthorName}>
          {getEntityPresentation(activityGroup.author)}
        </Text>
        {!noTimestamp && <Text>{this._renderTimestamp(activityGroup.timestamp)}</Text>}
      </View>
    );
  }

  _firstActivityChange(activity): any {
    if (!activity.added) {
      return null;
    }
    if (Array.isArray(activity.added)) {
      return activity.added[0];
    }
    return activity.added;
  }

  _renderCommentActivity(activityGroup) {
    const comment = this._firstActivityChange(activityGroup.comment);
    if (!comment) {
      return null;
    }

    const allAttachments = this.updateToAbsUrl(comment.attachments).concat(this.props.attachments);

    return (
      <CommentActions
        onReply={() => this.props.onReply(comment)}
        onCopyCommentLink={() => this.props.onCopyCommentLink(comment)}
        canEdit={comment && this.props.canUpdateComment(comment)}
        onEdit={() => this.props.onStartEditing(comment)}

        canDelete={comment && this.props.canDeleteComment(comment)}
        onDelete={() => this.props.onDeleteComment(comment)}
        disabled={!comment || activityGroup.merged}
      >
        <View>
          {!activityGroup.merged && this._renderUserInfo(activityGroup)}

          <View style={styles.activityChange}>

            <View key={comment.id}>
              <Comment
                key={comment.id}

                comment={comment}

                imageHeaders={this.props.imageHeaders}
                backendUrl={this.props.backendUrl}

                onIssueIdTap={this.props.onIssueIdTap}

                attachments={allAttachments}

                canRestore={this.props.canRestoreComment(comment)}
                canDeletePermanently={this.props.canDeleteCommentPermanently(comment)}

                onRestore={() => this.props.onRestoreComment(comment)}
                onDeletePermanently={() => this.props.onDeleteCommentPermanently(comment, activityGroup.comment.id)}

                activitiesEnabled={true}
              />

              {!comment.deleted && IssueVisibility.isSecured(comment.visibility) &&
              <CommentVisibility visibility={IssueVisibility.getVisibilityPresentation(comment.visibility)}/>}
            </View>

          </View>
        </View>
      </CommentActions>
    );
  }

  _renderWorkActivity(activityGroup) {
    const work = this._firstActivityChange(activityGroup.work);

    if (!work) {
      return null;
    }

    const duration = minutesAndHoursFor(work.duration);
    const spentTime = [duration.hours(), duration.minutes()].join(' ');

    return (
      <View>
        {!activityGroup.merged && this._renderUserInfo(activityGroup)}

        <View style={styles.activityChange}>

          {Boolean(work.text) && <View style={styles.workComment}><Text>{work.text}</Text></View>}

          {Boolean(work.date) && <Text>{absDate(work.date)}</Text>}

          <View style={styles.row}>
            <Text style={styles.activityLabel}>Spent time: </Text>
            <Text style={styles.workTime}>{spentTime}</Text>
            {work.type && <Text>{` ${work.type.name}`}</Text>}
          </View>

        </View>
      </View>
    );
  }

  _renderActivityByCategory = (activity) => {
    switch (true) {
    case Boolean(
      isActivityCategory.tag(activity) ||
      isActivityCategory.customField(activity) ||
      isActivityCategory.sprint(activity) ||
      isActivityCategory.work(activity) ||
      isActivityCategory.description(activity) ||
      isActivityCategory.summary(activity)
    ):
      return this.renderTextValueChange(activity, this.props.issueFields);
    case Boolean(isActivityCategory.link(activity)):
      return this._renderLinkChange(activity);
    case Boolean(isActivityCategory.attachment(activity)):
      return this._renderAttachmentChange(activity);
    }
    return null;
  };

  _renderHistoryAndRelatedChanges(activityGroup: Object, isRelatedChange: boolean) {
    if (activityGroup.events.length > 0) {
      return (
        <View style={isRelatedChange ? styles.activityRelatedChanges : styles.activityHistoryChanges}>
          {Boolean(!activityGroup.merged && !isRelatedChange) && this._renderUserInfo(activityGroup)}
          {activityGroup.merged && this._renderTimestamp(activityGroup.timestamp, {color: COLOR_FONT})}

          {activityGroup.events.map((event) => (
            <View key={event.id} style={styles.activityChange}>
              {this._renderActivityByCategory(event)}
            </View>
          ))}
        </View>
      );
    }
  }

  render() {
    const {activityPage, naturalCommentsOrder} = this.props;
    if (!activityPage) {
      return null;
    }
    const groupedActivities = this._processActivities(activityPage);
    const activities = createActivitiesModel(
      naturalCommentsOrder ? groupedActivities.reverse() : groupedActivities
    ) || [];

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
                activityGroup.merged ? styles.mergedActivity : null
              ]}>

                {!activityGroup.merged && this._renderUserAvatar(
                  activityGroup,
                  !!activityGroup.comment
                )}

                <View style={styles.activityItem}>
                  {activityGroup.comment && this._renderCommentActivity(activityGroup)}
                  {activityGroup.work && this._renderWorkActivity(activityGroup)}
                  {this._renderHistoryAndRelatedChanges(activityGroup, !!activityGroup.comment || !!activityGroup.work)}
                </View>

              </View>
            );
          })
          : <Text style={[styles.activityChange, {textAlign: 'center', marginTop: UNIT * 5}]}>No activity yet</Text>}
      </View>
    );
  }
}
