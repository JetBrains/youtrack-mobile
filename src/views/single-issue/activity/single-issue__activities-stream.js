/* @flow */

import React from 'react';

import {View, Text, TouchableOpacity} from 'react-native';

import ApiHelper from '../../../components/api/api__helper';
import AttachmentsRow from '../../../components/attachments-row/attachments-row';
import Avatar from '../../../components/avatar/avatar';
import Comment from '../../../components/comment/comment';
import CommentVisibility from '../../../components/comment/comment__visibility';
import CustomFieldChangeDelimiter from '../../../components/custom-field/custom-field__change-delimiter';
import Diff from '../../../components/diff/diff';
import getEventTitle from '../../../components/activity/activity__history-title';
import IssueVisibility from '../../../components/visibility/issue-visibility';
import log from '../../../components/log/log';
import {Reactions} from '../../../components/reactions/reactions';
import Router from '../../../components/router/router';
import usage from '../../../components/usage/usage';
import {
  getEntityPresentation,
  relativeDate,
  getReadableID,
  ytDate
} from '../../../components/issue-formatter/issue-formatter';
import {getApi} from '../../../components/api/api__instance';
import {getTextValueChange} from '../../../components/activity/activity__history-value';
import {IconDrag, IconHistory, IconMoreOptions, IconWork} from '../../../components/icon/icon';
import {isActivityCategory} from '../../../components/activity/activity__category';
import {isIOSPlatform, uuid} from '../../../util/util';
import {minutesAndHoursFor} from '../../../components/time-tracking/time-tracking';
import {SkeletonIssueActivities} from '../../../components/skeleton/skeleton';

import {HIT_SLOP} from '../../../components/common-styles/button';
import {UNIT} from '../../../components/variables/variables';

import styles from './single-issue-activity.styles';

import type IssuePermissions from '../../../components/issue-permissions/issue-permissions';
import type {ActivityItem, IssueActivity} from '../../../flow/Activity';
import type {Attachment, IssueComment} from '../../../flow/CustomFields';
import type {UITheme} from '../../../flow/Theme';
import type {WorkTimeSettings} from '../../../flow/WorkTimeSettings';
import type {YouTrackWiki} from '../../../flow/Wiki';

const CATEGORY_NAME = 'Issue Stream';

type Props = {
  issueFields: Array<Object>,
  activities: Array<IssueActivity> | null,
  attachments: Array<Attachment>,

  youtrackWiki: $Shape<YouTrackWiki>,

  canUpdateComment: (comment: IssueComment) => boolean,
  onStartEditing: (comment: IssueComment) => any,

  canDeleteComment: (comment: IssueComment) => any,
  canRestoreComment: (comment: IssueComment) => any,
  canDeleteCommentPermanently: (comment: IssueComment) => any,
  onDeleteComment: (comment: IssueComment) => any,
  onRestoreComment: (comment: IssueComment) => any,
  onDeleteCommentPermanently: (comment: IssueComment, activityId?: string) => any,

  onReply: (comment: IssueComment) => any,

  workTimeSettings: ?WorkTimeSettings,

  onShowCommentActions: (comment: IssueComment) => any,
  issuePermissions: IssuePermissions,

  uiTheme: UITheme
};

type Change = {
  added: ActivityItem,
  removed: ActivityItem
};


function SingleIssueActivities(props: Props) {

  const isMultiValueActivity = (activity: Object) => {
    if (isActivityCategory.customField(activity)) {
      const field = activity.field;
      if (!field) {
        return false;
      }
      return field.customField && field.customField.fieldType && field.customField.fieldType.isMultiValue;
    }

    if (activity.added?.length > 1 || activity.removed?.length > 1) {
      return true;
    }

    return false;
  };

  const getTextChange = (activity: IssueActivity, issueFields: Array<Object>): Change => {
    const getParams = (isRemovedValue) => ({
      activity,
      issueFields,
      workTimeSettings: props.workTimeSettings || {},
      isRemovedValue: isRemovedValue
    });

    return {
      added: getTextValueChange(getParams(false)),
      removed: getTextValueChange(getParams(true))
    };
  };

  const renderTextDiff = (activity: IssueActivity, textChange: Change) => {
    return <Diff
      title={getEventTitle(activity, true)}
      text1={textChange.removed}
      text2={textChange.added}
    />;
  };

  const renderTextChange = (activity: IssueActivity, textChange: Change) => {
    const isMultiValue = isMultiValueActivity(activity);
    return (
      <Text>
        <Text style={styles.activityLabel}>{getActivityEventTitle(activity)}</Text>

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
  };

  const renderTextValueChange = (activity: IssueActivity, issueFields: Array<Object>) => {
    const textChange = getTextChange(activity, issueFields);
    const isTextDiff = (
      isActivityCategory.description(activity) ||
      isActivityCategory.summary(activity)
    );

    return (
      <View style={styles.row}>
        <View style={{flexGrow: 2}}>
          {isTextDiff && renderTextDiff(activity, textChange)}
          {!isTextDiff && renderTextChange(activity, textChange)}
        </View>
      </View>
    );
  };

  const renderLinkChange = (activity: IssueActivity, uiTheme: UITheme) => {
    const linkedIssues = [].concat(activity.added).concat(activity.removed);
    return (
      <TouchableOpacity key={activity.id}>
        <View style={styles.row}>
          <Text style={styles.activityLabel}>{getActivityEventTitle(activity)}</Text>
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
                  linkedIssue.resolved && {color: uiTheme.colors.$icon},
                  linkedIssue.resolved && styles.activityRemoved
                ]}>
                  {readableIssueId}
                </Text>
                <Text style={[
                  styles.linkText,
                  linkedIssue.resolved && {color: uiTheme.colors.$icon},
                ]}>
                  {` ${linkedIssue.summary}`}
                </Text>
              </Text>
            );
          })
        }
      </TouchableOpacity>
    );
  };

  const updateToAbsUrl = (attachments: Array<Attachment> = []): Array<Attachment> => {
    if (attachments.length) {
      attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(attachments, props.youtrackWiki.backendUrl);
    }
    return attachments;
  };

  const getActivityEventTitle = (activity: IssueActivity) => {
    const title = getEventTitle(activity) || '';
    return `${title} `;
  };

  const renderAttachmentChange = (activity: Object, uiTheme: UITheme) => {
    const removed = activity.removed || [];
    const added = activity.added || [];
    const addedAndLaterRemoved = added.filter(it => !it.url);
    const addedAndAvailable = updateToAbsUrl(added.filter(it => it.url));
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
          uiTheme={uiTheme}
        />}
        {addedAndLaterRemoved.length > 0 && addedAndLaterRemoved.map(
          it => <Text style={styles.activityAdded} key={it.id}>{it.name}</Text>
        )}

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
  };

  const renderActivityIcon = (activityGroup: Object) => {
    const iconColor: string = props.uiTheme.colors.$iconAccent;
    if (activityGroup.work) {
      return <IconWork size={24} color={iconColor} style={{position: 'relative', top: -2}}/>;
    }
    return <IconHistory size={26} color={iconColor}/>;
  };

  const renderUserAvatar = (activityGroup: Object, showAvatar: boolean) => {
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
        {shouldRenderIcon && renderActivityIcon(activityGroup)}
      </View>
    );
  };

  const renderTimestamp = (timestamp, style) => {
    if (timestamp) {
      return (
        <Text style={[styles.activityTimestamp, style]}>
          {relativeDate(timestamp)}
        </Text>
      );
    }
  };

  const renderUserInfo = (activityGroup: Object, noTimestamp?: boolean) => {
    return (
      <View style={styles.activityAuthor}>
        <Text style={styles.activityAuthorName}>
          {getEntityPresentation(activityGroup.author)}
        </Text>
        {!noTimestamp && <Text>{renderTimestamp(activityGroup.timestamp)}</Text>}
      </View>
    );
  };

  const firstActivityChange = (activity): any => {
    if (!activity.added) {
      return null;
    }
    if (Array.isArray(activity.added)) {
      return activity.added[0];
    }
    return activity.added;
  };

  const renderCommentActions = (activityGroup: Object, uiTheme: UITheme) => {
    const comment = firstActivityChange(activityGroup.comment);
    if (!comment) {
      return null;
    }

    const disabled = activityGroup.merged;
    const isAuthor = props.issuePermissions.isCurrentUser(comment?.author);

    if (!comment.deleted) {
      return <View style={styles.activityCommentActions}>
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          disabled={disabled}
          onPress={() => isAuthor ? props.onStartEditing(comment) : props.onReply(comment)}>
          <Text style={styles.link}>
            {isAuthor ? 'Edit' : 'Reply'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          disabled={disabled}
          onPress={() => props.onShowCommentActions(comment)}>
          {isIOSPlatform()
            ? <IconMoreOptions size={24} color={uiTheme.colors.$icon}/>
            : <IconDrag size={22} color={uiTheme.colors.$icon}/>}
        </TouchableOpacity>
      </View>;
    }
  };

  const renderCommentActivity = (activityGroup: Object, uiTheme: UITheme) => {
    const comment: ActivityItem = firstActivityChange(activityGroup.comment);
    if (!comment) {
      return null;
    }

    const allAttachments = updateToAbsUrl(comment.attachments).concat(props.attachments || []);

    return (
      <View key={comment.id}>
        {!activityGroup.merged && renderUserInfo(activityGroup)}

        <View>

          <Comment
            key={comment.id}
            comment={comment}
            youtrackWiki={props.youtrackWiki}

            attachments={allAttachments}
            canRestore={props.canRestoreComment(comment)}
            canDeletePermanently={props.canDeleteCommentPermanently(comment)}
            onRestore={() => props.onRestoreComment(comment)}
            onDeletePermanently={() => props.onDeleteCommentPermanently(comment, activityGroup.comment.id)}
            activitiesEnabled={true}
            uiTheme={props.uiTheme}
          />

          {!comment.deleted && IssueVisibility.isSecured(comment.visibility) &&
          <CommentVisibility
            style={styles.visibility}
            visibility={IssueVisibility.getVisibilityPresentation(comment.visibility)}
            color={uiTheme.colors.$iconAccent}
          />}
          {<Reactions reactions={comment.reactions} reactionOrder={comment.reactionOrder}/>}

        </View>
      </View>
    );

  };

  const renderWorkActivity = (activityGroup) => {
    const work = firstActivityChange(activityGroup.work);

    if (!work) {
      return null;
    }

    const duration = minutesAndHoursFor(work.duration);
    const spentTime = [duration.hours(), duration.minutes()].join(' ');

    return (
      <View>
        {!activityGroup.merged && renderUserInfo(activityGroup)}

        <View style={styles.activityChange}>

          {Boolean(work.text) && (
            <View style={styles.workComment}><Text style={styles.secondaryText}>{work.text}</Text></View>
          )}

          {Boolean(work.date) && <Text style={styles.secondaryText}>{ytDate(work.date)}</Text>}

          <Text>
            <Text style={styles.activityLabel}>Spent time: </Text>
            <Text style={styles.workTime}>{spentTime}</Text>
            {work.type && <Text style={styles.secondaryText}>{` ${work.type.name}`}</Text>}
          </Text>

        </View>
      </View>
    );
  };

  const renderActivityByCategory = (activity, uiTheme: UITheme) => {
    switch (true) {
    case Boolean(
      isActivityCategory.tag(activity) ||
      isActivityCategory.customField(activity) ||
      isActivityCategory.sprint(activity) ||
      isActivityCategory.work(activity) ||
      isActivityCategory.description(activity) ||
      isActivityCategory.summary(activity)
    ):
      return renderTextValueChange(activity, props.issueFields);
    case Boolean(isActivityCategory.link(activity)):
      return renderLinkChange(activity, uiTheme);
    case Boolean(isActivityCategory.attachment(activity)):
      return renderAttachmentChange(activity, uiTheme);
    }
    return null;
  };

  const renderHistoryAndRelatedChanges = (activityGroup: Object, isRelatedChange: boolean, uiTheme: UITheme) => {
    if (activityGroup.events.length > 0) {
      return (
        <View style={isRelatedChange ? styles.activityRelatedChanges : styles.activityHistoryChanges}>
          {Boolean(!activityGroup.merged && !isRelatedChange) && renderUserInfo(activityGroup)}
          {activityGroup.merged && renderTimestamp(activityGroup.timestamp)}

          {activityGroup.events.map((event) => (
            <View key={event.id} style={styles.activityChange}>
              {renderActivityByCategory(event, uiTheme)}
            </View>
          ))}
        </View>
      );
    }
  };

  const {activities, uiTheme} = props;

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
            <View key={uuid()}>
              {index > 0 && !activityGroup.merged && <View style={styles.activitySeparator}/>}

              <View style={[
                styles.activity,
                activityGroup.merged ? styles.mergedActivity : null
              ]}>

                {renderUserAvatar(activityGroup, !!activityGroup.comment)}

                <View style={styles.activityItem}>
                  {activityGroup.comment && renderCommentActivity(activityGroup, uiTheme)}

                  {activityGroup.work && renderWorkActivity(activityGroup)}

                  {renderHistoryAndRelatedChanges(activityGroup, !!activityGroup.comment || !!activityGroup.work, uiTheme)}

                  {activityGroup.comment && renderCommentActions(activityGroup, uiTheme)}
                </View>

              </View>
            </View>
          );
        })
        : <Text style={styles.activityNoActivity}>No activity yet</Text>}
    </View>
  );
}


export default React.memo<Props>(SingleIssueActivities);
