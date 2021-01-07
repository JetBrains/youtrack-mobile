/* @flow */

import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import ApiHelper from '../api/api__helper';
import AttachmentsRow from '../attachments-row/attachments-row';
import Avatar from '../avatar/avatar';
import Comment from '../comment/comment';
import CommentReactions from '../comment/comment-reactions';
import CommentVisibility from '../comment/comment__visibility';
import CustomFieldChangeDelimiter from '../custom-field/custom-field__change-delimiter';
import Diff from '../diff/diff';
import Feature, {FEATURE_VERSION} from '../feature/feature';
import getEventTitle from '../activity/activity__history-title';
import IssueVisibility from '../visibility/issue-visibility';
import log from '../log/log';
import ReactionAddIcon from '../reactions/new-reaction.svg';
import Router from '../router/router';
import usage from '../usage/usage';
import {ANALYTICS_ISSUE_STREAM_SECTION} from '../analytics/analytics-ids';
import {getApi} from '../api/api__instance';
import {getEntityPresentation, getReadableID, relativeDate, ytDate} from '../issue-formatter/issue-formatter';
import {getTextValueChange} from '../activity/activity__history-value';
import {IconDrag, IconHistory, IconMoreOptions, IconWork} from '../icon/icon';
import {isActivityCategory} from '../activity/activity__category';
import {isIOSPlatform, uuid} from '../../util/util';
import {minutesAndHoursFor} from '../time-tracking/time-tracking';
import {SkeletonIssueActivities} from '../skeleton/skeleton';

import {HIT_SLOP} from '../common-styles/button';
import {UNIT} from '../variables/variables';
import styles from './activity__stream.styles';

import type {Attachment, IssueComment} from '../../flow/CustomFields';
import type {Reaction} from '../../flow/Reaction';
import type {Activity, ActivityChange, ActivityItem, ActivityStreamCommentActions} from '../../flow/Activity';
import type {IssueFull} from '../../flow/Issue';
import type {UITheme} from '../../flow/Theme';
import type {WorkTimeSettings} from '../../flow/WorkTimeSettings';
import type {YouTrackWiki} from '../../flow/Wiki';
import type {CustomError} from '../../flow/Error';
import type {User} from '../../flow/User';


export type ActivityStreamProps = {
  activities: Array<Activity> | null,
  attachments: Array<Attachment>,
  commentActions?: ActivityStreamCommentActions,
  currentUser: User,
  issueFields?: Array<Object>,
  onReactionSelect: (
    issueId: string,
    comment: IssueComment,
    reaction: Reaction,
    activities: Array<ActivityItem>,
    onReactionUpdate: (activities: Array<ActivityItem>, error?: CustomError) => void
  ) => any,
  uiTheme: UITheme,
  workTimeSettings: ?WorkTimeSettings,
  youtrackWiki: $Shape<YouTrackWiki>
};

export type ActivityStreamPropsReaction = {
  onReactionPanelOpen?: (comment: IssueComment) => void,
  onSelectReaction?: (comment: IssueComment, reaction: Reaction) => void
}

export const ActivityStream = (props: ActivityStreamProps & ActivityStreamPropsReaction) => {
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

  const getTextChange = (activity: Activity, issueFields: ?Array<Object>): ActivityChange => {
    const getParams = (isRemovedValue: boolean) => ({
      activity,
      issueFields: issueFields,
      workTimeSettings: props.workTimeSettings || {},
      isRemovedValue: isRemovedValue
    });

    return {
      added: getTextValueChange(getParams(false)),
      removed: getTextValueChange(getParams(true))
    };
  };

  const renderTextDiff = (activity: Activity, textChange: ActivityChange) => {
    return <Diff
      title={getEventTitle(activity, true)}
      text1={textChange.removed}
      text2={textChange.added}
    />;
  };

  const renderTextChange = (activity: Activity, textChange: ActivityChange) => {
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

  const renderTextValueChange = (activity: Activity, issueFields?: Array<Object>) => {
    const textChange = getTextChange(activity, issueFields);
    const isTextDiff = (
      isActivityCategory.description(activity) ||
      isActivityCategory.summary(activity)
    );

    return (
      <View style={styles.activityTextValueChange}>
        {isTextDiff && renderTextDiff(activity, textChange)}
        {!isTextDiff && renderTextChange(activity, textChange)}
      </View>
    );
  };

  const renderLinkChange = (activity: Activity) => {
    const linkedIssues = [].concat(activity.added).concat(
      activity.removed.map((link: IssueFull) => ({...link, isRemoved: true}))
    );

    return (
      <TouchableOpacity key={activity.id}>
        <View>
          <Text style={styles.activityLabel}>{getActivityEventTitle(activity)}</Text>
        </View>
        {
          linkedIssues.map((linkedIssue: IssueFull & { isRemoved?: boolean }) => {
            const readableIssueId: string = getReadableID(linkedIssue);
            return (
              <Text
                key={linkedIssue.id}
                style={{...styles.linkedIssue, ...(linkedIssue.isRemoved ? styles.activityRemoved : {})}}
                onPress={() => Router.Issue({issueId: readableIssueId})}>
                <Text style={[
                  styles.link,
                  linkedIssue.resolved && styles.secondaryTextColor.color,
                  linkedIssue.resolved && styles.activityRemoved
                ]}>
                  {readableIssueId}
                </Text>
                <Text style={[
                  styles.link,
                  linkedIssue.resolved && styles.secondaryTextColor.color
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

  const getActivityEventTitle = (activity: Activity) => {
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
            usage.trackEvent(
              ANALYTICS_ISSUE_STREAM_SECTION, type === 'image' ? 'Showing image' : 'Open attachment by URL'
            )
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

  const renderCommentActions = (activityGroup: Object) => {
    const comment = firstActivityChange(activityGroup.comment);
    if (!comment) {
      return null;
    }

    const disabled = activityGroup.merged;
    const commentActions = props.commentActions;
    const isAuthor = commentActions && commentActions.isAuthor(comment);

    const canComment: boolean = !!commentActions?.canCommentOn;
    const canUpdate: boolean = !!commentActions && commentActions.canUpdateComment(comment);

    if (!comment.deleted) {
      // $FlowFixMe
      const reactionAddIcon: string = <ReactionAddIcon style={styles.activityCommentActionsAddReaction}/>;
      return (
        <View style={styles.activityCommentActions}>
          <View style={styles.activityCommentActionsMain}>
            {(canUpdate || canComment) && (
              <TouchableOpacity
                hitSlop={HIT_SLOP}
                disabled={disabled}
                onPress={() => isAuthor ? commentActions && commentActions.onStartEditing(
                  comment) : commentActions && commentActions.onReply(
                  comment)}>
                <Text style={styles.link}>
                  {isAuthor ? 'Edit' : 'Reply'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {!!props.onReactionPanelOpen && <Feature version={FEATURE_VERSION.reactions}>
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              disabled={disabled}
              onPress={() => {if (props.onReactionPanelOpen) props.onReactionPanelOpen(comment);}}
            >
              {reactionAddIcon}
            </TouchableOpacity>
          </Feature>}

          {Boolean(commentActions && commentActions.onShowCommentActions) && <TouchableOpacity
            hitSlop={HIT_SLOP}
            disabled={disabled}
            onPress={() => commentActions && commentActions.onShowCommentActions(comment, activityGroup.comment.id)}>
            {isIOSPlatform()
              ? <IconMoreOptions size={18} color={styles.activityCommentActionsOther.color}/>
              : <IconDrag size={18} color={styles.activityCommentActionsOther.color}/>}
          </TouchableOpacity>}
        </View>
      );
    }
  };

  const renderCommentActivity = (activityGroup: Object) => {
    const comment: ActivityItem = firstActivityChange(activityGroup.comment);
    if (!comment) {
      return null;
    }

    const allAttachments = updateToAbsUrl(comment.attachments).concat(props.attachments || []);
    const commentActions: ActivityStreamCommentActions = props.commentActions || {};

    return (
      <View key={comment.id}>
        {!activityGroup.merged && renderUserInfo(activityGroup)}

        <View>

          <Comment
            attachments={allAttachments}
            canDeletePermanently={!!commentActions?.canDeleteCommentPermanently}
            canRestore={commentActions?.canRestoreComment ? commentActions.canRestoreComment(comment) : false}
            comment={comment}
            key={comment.id}
            onDeletePermanently={() => {
              if (commentActions.onDeleteCommentPermanently) {
                commentActions.onDeleteCommentPermanently(comment, activityGroup.comment.id);
              }
            }}
            onRestore={() => { if (commentActions.onRestoreComment) commentActions.onRestoreComment(comment); }}
            uiTheme={props.uiTheme}
            youtrackWiki={props.youtrackWiki}
          />

          {!comment.deleted && IssueVisibility.isSecured(comment.visibility) &&
          <CommentVisibility
            style={styles.activityVisibility}
            visibility={IssueVisibility.getVisibilityPresentation(comment.visibility)}
            color={props.uiTheme.colors.$iconAccent}
          />}
          {!!props.onSelectReaction && <CommentReactions
            style={styles.commentReactions}
            comment={comment}
            currentUser={props.currentUser}
            onReactionSelect={props.onSelectReaction}
          />}

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
            <View style={styles.activityWorkComment}><Text style={styles.secondaryTextColor}>{work.text}</Text></View>
          )}

          {Boolean(work.date) && <Text style={styles.secondaryTextColor}>{ytDate(work.date)}</Text>}

          <Text>
            <Text style={styles.activityLabel}>Spent time: </Text>
            <Text style={styles.activityWorkTime}>{spentTime}</Text>
            {work.type && <Text style={styles.secondaryTextColor}>{` ${work.type.name}`}</Text>}
          </Text>

        </View>
      </View>
    );
  };

  const renderVisibilityActivity = (activity) => {
    const textChange = getTextChange(activity, []);
    return renderTextChange(activity, textChange);
  };

  const renderActivityByCategory = (activity: Activity, uiTheme: UITheme) => {
    switch (true) {
    case Boolean(
      isActivityCategory.tag(activity) ||
      isActivityCategory.customField(activity) ||
      isActivityCategory.sprint(activity) ||
      isActivityCategory.work(activity) ||
      isActivityCategory.description(activity) ||
      isActivityCategory.summary(activity)
    ):
      return renderTextValueChange(activity);
    case Boolean(isActivityCategory.link(activity)):
      return renderLinkChange(activity);
    case Boolean(isActivityCategory.attachment(activity)):
      return renderAttachmentChange(activity, uiTheme);
    case Boolean(isActivityCategory.visibility(activity)):
      return renderVisibilityActivity(activity);
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


  if (!props.activities) {
    return <SkeletonIssueActivities/>;
  }
  return (
    <>
      {props.activities?.length > 0
        ? props.activities.map((activityGroup, index) => {
          if (activityGroup.hidden) {
            return null;
          }

          return (
            <View key={uuid()}>
              {index > 0 && !activityGroup.merged && <View style={styles.activitySeparator}/>}

              <View style={[
                styles.activity,
                activityGroup.merged ? styles.activityMerged : null
              ]}>

                {renderUserAvatar(activityGroup, !!activityGroup.comment)}

                <View style={styles.activityItem}>
                  {activityGroup.comment && renderCommentActivity(activityGroup)}

                  {activityGroup.work && renderWorkActivity(activityGroup)}

                  {renderHistoryAndRelatedChanges(
                    activityGroup,
                    !!activityGroup.comment || !!activityGroup.work,
                    props.uiTheme
                  )}

                  {activityGroup.comment && renderCommentActions(activityGroup)}
                </View>

              </View>
            </View>
          );
        })
        : !!props.activities && <Text style={styles.activityNoActivity}>No activity yet</Text>
      }
    </>
  );
};
