/* @flow */
import styles from './single-issue.styles';
import Comment from '../../components/comment/comment';
import type {Attachment, IssueComment} from '../../flow/CustomFields';

import {View, Text, TouchableOpacity, Platform, Image} from 'react-native';
import React, {Component} from 'react';

import {isActivityCategory} from '../../components/activity/activity__category';

import CommentVisibility from '../../components/comment/comment__visibility';
import IssueVisibility from '../../components/issue-visibility/issue-visibility';
import CommentActions from '../../components/comment/comment__actions';

import {getEntityPresentation, relativeDate, absDate} from '../../components/issue-formatter/issue-formatter';

import {mergeActivities} from '../../components/activity/activity__merge-activities';
import {groupActivities} from '../../components/activity/activity__group-activities';
import {createActivitiesModel} from '../../components/activity/activity__create-model';

import getHistoryLabel from '../../components/activity/activity__history-label';
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
import TextView from '../../components/text-view/text-view';

import type {WorkTimeSettings} from '../../flow/WorkTimeSettings';
import type {IssueActivity} from '../../flow/Activity';

import {COLOR_FONT, COLOR_FONT_GRAY, UNIT} from '../../components/variables/variables';

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

export default class SingleIssueActivities extends Component<Props, void> {
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

  _renderTextValueChange(activity: Object, issueFields: Array<Object>) {
    const isMultiValue = this._isMultiValueActivity(activity);
    const getParams = (isRemovedValue) => ({
      activity,
      issueFields,
      workTimeSettings: this.props.workTimeSettings,
      isRemovedValue: isRemovedValue
    });
    const removed: string = getTextValueChange(getParams(true));
    const added: string = getTextValueChange(getParams(false));
    //TODO(xi-eye): implement more convenient textDiff component
    const isSummaryOrDescriptionChange = isActivityCategory.description(activity) || isActivityCategory.summary(activity);
    let delimiter: string;
    const TextRenderer: any = isSummaryOrDescriptionChange ? TextView : Text;

    if (isMultiValue) {
      delimiter = isSummaryOrDescriptionChange ? '\n' : ', ';
    } else {
      delimiter = Platform.OS === 'ios' ? ' → ' : ' ➔ ';
    }

    return (
      <View style={styles.row}>
        <Text style={{flexGrow: 2}}>
          <Text style={styles.activityLabel}>{getHistoryLabel(activity)}</Text>

          <TextRenderer
            style={[styles.activityText, isMultiValue || removed && !added ? styles.activityRemoved : null]}
            text={removed}>{removed}</TextRenderer>

          {Boolean(removed && added) && (
            <Text style={styles.activityText}>
              {delimiter}
            </Text>
          )}

          <TextRenderer style={styles.activityText} text={added}>{added}</TextRenderer>

        </Text>
      </View>
    );
  }

  _renderLinkChange(event: Object) {
    const linkedIssues = [].concat(event.added).concat(event.removed);
    return (
      <TouchableOpacity key={event.id}>
        <View style={styles.row}>
          <Text style={styles.activityLabel}>{getHistoryLabel(event)}</Text>
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

  _renderAttachmentChange(event: Object) {
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

                attachments={comment.attachments}

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

          {work.text && <View style={styles.workComment}><Text>{work.text}</Text></View>}

          {work.date && <Text>{absDate(work.date)}</Text>}

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
      return this._renderTextValueChange(activity, this.props.issueFields);
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
    );

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
