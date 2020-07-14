/* @flow */
import styles from './single-issue-activity.styles';
import Comment from '../../../components/comment/comment';
import type {Attachment, IssueComment} from '../../../flow/CustomFields';

import {View, Text, TouchableOpacity} from 'react-native';
import React, {PureComponent} from 'react';

import {isActivityCategory} from '../../../components/activity/activity__category';

import CommentVisibility from '../../../components/comment/comment__visibility';
import IssueVisibility from '../../../components/visibility/issue-visibility';

import {
  getEntityPresentation,
  relativeDate,
  absDate,
  getReadableID
} from '../../../components/issue-formatter/issue-formatter';

import getEventTitle from '../../../components/activity/activity__history-title';
import {getTextValueChange} from '../../../components/activity/activity__history-value';
import {minutesAndHoursFor} from '../../../components/time-tracking/time-tracking';

import Avatar from '../../../components/avatar/avatar';

import Router from '../../../components/router/router';

import {IconDrag, IconHistory, IconMoreOptions, IconWork} from '../../../components/icon/icon';

import usage from '../../../components/usage/usage';
import log from '../../../components/log/log';
import {getApi} from '../../../components/api/api__instance';
import AttachmentsRow from '../../../components/attachments-row/attachments-row';
import ApiHelper from '../../../components/api/api__helper';
import CustomFieldChangeDelimiter from '../../../components/custom-field/custom-field__change-delimiter';
import {isIOSPlatform} from '../../../util/util';
import {SkeletonIssueActivities} from '../../../components/skeleton/skeleton';

import type {WorkTimeSettings} from '../../../flow/WorkTimeSettings';
import type {ActivityItem, IssueActivity} from '../../../flow/Activity';

import {
  COLOR_FONT_GRAY,
  COLOR_ICON_GREY,
  COLOR_ICON_LIGHT_BLUE,
  UNIT
} from '../../../components/variables/variables';
import Diff from '../../../components/diff/diff';
import {HIT_SLOP} from '../../../components/common-styles/button';

import type IssuePermissions from '../../../components/issue-permissions/issue-permissions';

const CATEGORY_NAME = 'Issue Stream';

type Props = {
  issueFields: Array<Object>,
  activities: Array<IssueActivity> | null,
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

  onShowCommentActions: (comment: IssueComment) => any,
  issuePermissions: IssuePermissions
};

type DefaultProps = {
  onCopyCommentLink: Function,
  onReply: Function,
  workTimeSettings: WorkTimeSettings
};

type Change = {
  added: ActivityItem,
  removed: ActivityItem
};

export default class SingleIssueActivities extends PureComponent<Props, void> {
  static defaultProps: DefaultProps = {
    onReply: () => {},
    onCopyCommentLink: () => {},
    workTimeSettings: {},
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
        <Text style={styles.activityLabel}>{this.getActivityEventTitle(activity)}</Text>

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

  _renderLinkChange(activity: IssueActivity) {
    const linkedIssues = [].concat(activity.added).concat(activity.removed);
    return (
      <TouchableOpacity key={activity.id}>
        <View style={styles.row}>
          <Text style={styles.activityLabel}>{this.getActivityEventTitle(activity)}</Text>
        </View>
        {
          linkedIssues.map((linkedIssue) => {
            const readableIssueId = getReadableID(linkedIssue);
            return (
              <Text
                key={linkedIssue.id}
                style={{
                  lineHeight: UNIT * 2.5,
                  marginTop: UNIT / 4
                }}
                onPress={() => Router.SingleIssue({issueId: readableIssueId})}>
                <Text style={[
                  styles.linkText,
                  linkedIssue.resolved && {color: COLOR_FONT_GRAY},
                  linkedIssue.resolved && styles.activityRemoved
                ]}>
                  {`${readableIssueId} ${linkedIssue.summary}`}
                </Text>
              </Text>
            );
          })
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

  getActivityEventTitle(activity: IssueActivity) {
    const title = getEventTitle(activity) || '';
    return `${title} `;
  }

  _renderAttachmentChange(activity: Object) {
    const removed = activity.removed || [];
    const added = activity.added || [];
    const addedAndLaterRemoved = added.filter(it => !it.url);
    const addedAndAvailable = this.updateToAbsUrl(added.filter(it => it.url));
    const hasAddedAttachments = addedAndAvailable.length > 0;

    return (
      <View key={activity.id}>
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
        <Text style={hasAddedAttachments && {marginTop: UNIT / 2}}>{activity.removed.map((it, index) =>
          <Text key={it.id}>
            {index > 0 && ', '}
            <Text style={styles.activityRemoved}>{it.name}</Text>
          </Text>
        )}
        </Text>}
      </View>
    );
  }

  renderActivityIcon(activityGroup: Object) {
    if (activityGroup.work) {
      return <IconWork size={24} color={COLOR_ICON_LIGHT_BLUE} style={{position: 'relative', top: -2}}/>;
    }
    return <IconHistory size={26} color={COLOR_ICON_LIGHT_BLUE}/>;
  }

  _renderUserAvatar(activityGroup: Object, showAvatar: boolean) {
    const shouldRenderIcon: boolean = Boolean(!activityGroup.merged && !showAvatar);

    return (
      <View style={styles.activityAvatar}>
        {Boolean(!activityGroup.merged && showAvatar) && (
          <Avatar
            userName={getEntityPresentation(activityGroup.author)}
            size={32}
            source={{uri: activityGroup.author.avatarUrl}}
          />
        )}
        {shouldRenderIcon && this.renderActivityIcon(activityGroup)}
      </View>
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
      <View style={styles.activityAuthor}>
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

  renderCommentActions(activityGroup: Object) {
    const comment = this._firstActivityChange(activityGroup.comment);
    if (!comment) {
      return null;
    }

    const disabled = activityGroup.merged;
    const isAuthor = this.props.issuePermissions.isCurrentUser(comment.author);

    if (!comment.deleted) {
      return <View style={styles.activityCommentActions}>
        <View style={styles.container}>
          <TouchableOpacity
            hitSlop={HIT_SLOP}
            disabled={disabled}
            onPress={() => isAuthor ? this.props.onStartEditing(comment) : this.props.onReply(comment)}>
            <Text style={styles.link}>
              {isAuthor ? 'Edit' : 'Reply'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          disabled={disabled}
          onPress={() => this.props.onShowCommentActions(comment)}>
          {isIOSPlatform()
            ? <IconMoreOptions size={24} color={COLOR_ICON_GREY}/>
            : <IconDrag size={22} color={COLOR_ICON_GREY}/>}
        </TouchableOpacity>
      </View>;
    }
  }

  renderCommentActivity(activityGroup: Object) {
    const comment = this._firstActivityChange(activityGroup.comment);
    if (!comment) {
      return null;
    }

    const allAttachments = this.updateToAbsUrl(comment.attachments).concat(this.props.attachments);
    return (
      <View key={comment.id}>
        {!activityGroup.merged && this._renderUserInfo(activityGroup)}

        <View style={styles.activityChange}>

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
          <CommentVisibility
            style={styles.visibility}
            visibility={IssueVisibility.getVisibilityPresentation(comment.visibility)}
            color={COLOR_ICON_LIGHT_BLUE}
          />}

        </View>
      </View>
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
          {activityGroup.merged && this._renderTimestamp(activityGroup.timestamp)}

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
    const {activities} = this.props;

    if (!activities) {
      return <SkeletonIssueActivities/>;
    }

    return (
      <View>
        {activities.length > 0
          ? activities.map((activityGroup, index) => {
            if (activityGroup.hidden) {
              return null;
            }

            return (
              <View key={`${activityGroup.timestamp}-${index}`}>
                {index > 0 && !activityGroup.merged && <View style={styles.activitySeparator}/>}

                <View style={[
                  styles.activity,
                  activityGroup.merged ? styles.mergedActivity : null
                ]}>

                  {this._renderUserAvatar(activityGroup, !!activityGroup.comment)}

                  <View style={styles.activityItem}>
                    {activityGroup.comment && this.renderCommentActivity(activityGroup)}

                    {activityGroup.work && this._renderWorkActivity(activityGroup)}

                    {this._renderHistoryAndRelatedChanges(activityGroup, !!activityGroup.comment || !!activityGroup.work)}

                    {activityGroup.comment && this.renderCommentActions(activityGroup)}
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
