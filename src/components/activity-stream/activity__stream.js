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
import ReactionAddIcon from '../reactions/new-reaction.svg';
import StreamLink from './activity__stream-link';
import StreamTimestamp from './activity__stream-timestamp';
import StreamUserInfo from './activity__stream-user-info';
import StreamWork from './activity__stream-work';
import usage from '../usage/usage';
import {ANALYTICS_ISSUE_STREAM_SECTION} from '../analytics/analytics-ids';
import {DEFAULT_WORK_TIME_SETTINGS} from '../time-tracking/time-tracking__default-settings';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';
import {getTextValueChange} from '../activity/activity__history-value';
import {firstActivityChange, getActivityEventTitle} from './activity__stream-helper';
import {IconDrag, IconHistory, IconMoreOptions, IconWork} from '../icon/icon';
import {isActivityCategory} from '../activity/activity__category';
import {guid, isIOSPlatform} from '../../util/util';
import {SkeletonIssueActivities} from '../skeleton/skeleton';

import {HIT_SLOP} from '../common-styles/button';
import {UNIT} from '../variables/variables';

import styles from './activity__stream.styles';

import type {
  Activity,
  ActivityItem,
  ActivityStreamCommentActions,
  ActivityChangeText,
} from '../../flow/Activity';
import type {Attachment, IssueComment} from '../../flow/CustomFields';
import type {CustomError} from '../../flow/Error';
import type {Node} from 'react';
import type {Reaction} from '../../flow/Reaction';
import type {TextValueChangeParams} from '../activity/activity__history-value';
import type {UITheme} from '../../flow/Theme';
import type {User} from '../../flow/User';
import type {WorkItem, WorkTimeSettings} from '../../flow/Work';
import type {YouTrackWiki} from '../../flow/Wiki';


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
  youtrackWiki: YouTrackWiki,
  onWorkDelete?: () => any,
  onWorkUpdate?: (workItem?: WorkItem) => void,
  onCheckboxUpdate?: (checked: boolean, position: number, comment: IssueComment) => Function,
};

export type ActivityStreamPropsReaction = {
  onReactionPanelOpen?: (comment: IssueComment) => void,
  onSelectReaction?: (comment: IssueComment, reaction: Reaction) => void
}

export const ActivityStream = (props: ActivityStreamProps & ActivityStreamPropsReaction): Node => {
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

  const getTextChange = (activity: Activity, issueFields: ?Array<Object>): ActivityChangeText => {
    const getParams = (isRemovedValue: boolean): TextValueChangeParams => ({
      activity,
      issueFields: issueFields,
      workTimeSettings: props.workTimeSettings || DEFAULT_WORK_TIME_SETTINGS,
      isRemovedValue: isRemovedValue,
    });

    return {
      added: getTextValueChange(getParams(false)),
      removed: getTextValueChange(getParams(true)),
    };
  };

  const renderTextDiff = (activity: Activity, textChange: ActivityChangeText) => {
    return <Diff
      title={getEventTitle(activity, true)}
      text1={textChange.removed}
      text2={textChange.added}
    />;
  };

  const renderTextChange = (activity: Activity, textChange: ActivityChangeText) => {
    const isMultiValue = isMultiValueActivity(activity);
    return (
      <Text>
        <Text style={styles.activityLabel}>{getActivityEventTitle(activity)}</Text>

        <Text
          style={[
            styles.activityText,
            isMultiValue || textChange.removed && !textChange.added ? styles.activityRemoved : null,
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
    const textChange: ActivityChangeText = getTextChange(activity, issueFields);
    const isTextDiff: boolean = (
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

  const renderLinkChange = (activity: Activity) => <StreamLink activity={activity}/>;

  const updateToAbsUrl = (attachments: Array<Attachment> = []): Array<Attachment> => {
    if (attachments.length) {
      attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(attachments, props.youtrackWiki.backendUrl);
    }
    return attachments;
  };

  const renderAttachments = (attachments: Array<Attachment> = [], uiTheme: UITheme): Node => {
    return (
      <AttachmentsRow
        attachments={updateToAbsUrl(attachments)}
        attachingImage={null}
        onOpenAttachment={(type: string) => (
          usage.trackEvent(
            ANALYTICS_ISSUE_STREAM_SECTION, type === 'image' ? 'Showing image' : 'Open attachment by URL'
          )
        )}
        uiTheme={uiTheme}
      />
    );
  };

  const renderAttachmentChange = (activity: Object, uiTheme: UITheme) => {
    const removed: Array<any> = activity.removed || [];
    const added: Array<any> = activity.added || [];
    const addedAndLaterRemoved: Array<any> = added.filter(it => !it.url);
    const addedAndAvailable: Array<any> = added.filter(it => it.url);
    const hasAddedAttachments: boolean = addedAndAvailable.length > 0;

    return (
      <View key={activity.id}>
        {hasAddedAttachments && renderAttachments(addedAndAvailable, uiTheme)}
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

  const renderTimestamp = (timestamp, style) => <StreamTimestamp timestamp={timestamp} style={style}/>;

  const renderUserInfo = (activityGroup: Object, noTimestamp?: boolean) => (
    <StreamUserInfo activityGroup={activityGroup} noTimestamp={noTimestamp}/>
  );

  const getCommentFromActivityGroup = (activityGroup: Object): IssueComment | null => (
    firstActivityChange(activityGroup.comment)
  );

  const renderCommentActions = (activityGroup: Object) => {
    const comment: IssueComment | null = getCommentFromActivityGroup(activityGroup);
    if (!comment) {
      return null;
    }

    const disabled = activityGroup.merged;
    const commentActions = props.commentActions;
    const isAuthor = commentActions && commentActions.isAuthor && commentActions.isAuthor(comment);

    const canComment: boolean = !!commentActions?.canCommentOn;
    const canUpdate: boolean = !!commentActions && !!commentActions.canUpdateComment && commentActions.canUpdateComment(comment);

    if (!comment.deleted) {
      // $FlowFixMe
      const reactionAddIcon: string = <ReactionAddIcon style={styles.activityCommentActionsAddReaction}/>;
      return (
        <View style={styles.activityCommentActions}>
          <View style={styles.activityCommentActionsMain}>
            {canComment && !isAuthor && (
              <TouchableOpacity
                hitSlop={HIT_SLOP}
                disabled={disabled}
                onPress={() => {
                  if (commentActions && commentActions.onReply) {
                    commentActions.onReply(comment);
                  }
                }}>
                <Text style={styles.link}>
                  Reply
                </Text>
              </TouchableOpacity>
            )}
            {canUpdate && isAuthor && (
              <TouchableOpacity
                hitSlop={HIT_SLOP}
                disabled={disabled}
                onPress={() => {
                  if (commentActions && commentActions.onStartEditing) {
                    commentActions.onStartEditing(comment);
                  }
                }}>
                <Text style={styles.link}>
                  Edit
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {!!props.onReactionPanelOpen && <Feature version={FEATURE_VERSION.reactions}>
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              disabled={disabled}
              onPress={() => {if (props.onReactionPanelOpen) {props.onReactionPanelOpen(comment);}}}
            >
              {reactionAddIcon}
            </TouchableOpacity>
          </Feature>}

          {Boolean(commentActions && commentActions.onShowCommentActions) && <TouchableOpacity
            hitSlop={HIT_SLOP}
            disabled={disabled}
            onPress={() => {
              if (commentActions?.onShowCommentActions) {
                commentActions.onShowCommentActions(comment, activityGroup.comment.id);
              }
            }}>
            {isIOSPlatform()
              ? <IconMoreOptions size={18} color={styles.activityCommentActionsOther.color}/>
              : <IconDrag size={18} color={styles.activityCommentActionsOther.color}/>}
          </TouchableOpacity>}
        </View>
      );
    }
  };

  const renderCommentActivityReactions = (activityGroup: Object) => {
    const comment: IssueComment | null = getCommentFromActivityGroup(activityGroup);
    if (!comment) {
      return null;
    }
    return <CommentReactions
      style={styles.commentReactions}
      comment={comment}
      currentUser={props.currentUser}
      onReactionSelect={props.onSelectReaction}
    />;
  };

  const renderCommentActivity = (activityGroup: Object) => {
    const comment: IssueComment | null = getCommentFromActivityGroup(activityGroup);
    if (!comment) {
      return null;
    }

    const allAttachments = updateToAbsUrl(comment.attachments).concat(props.attachments || []);
    const commentActions: ?ActivityStreamCommentActions = props.commentActions;

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
              if (commentActions?.onDeleteCommentPermanently) {
                commentActions.onDeleteCommentPermanently(comment, activityGroup.comment.id);
              }
            }}
            onRestore={() => { if (commentActions?.onRestoreComment) {commentActions.onRestoreComment(comment);} }}
            uiTheme={props.uiTheme}
            youtrackWiki={props.youtrackWiki}
            onCheckboxUpdate={
              (checked: boolean, position: number) => (
                props.onCheckboxUpdate && comment && props.onCheckboxUpdate(checked, position, comment)
              )
            }
          />

          {!comment.deleted && (comment?.attachments || []).length > 0 && (
            <View
              style={styles.activityCommentAttachments}
            >
              {renderAttachments(comment.attachments, props.uiTheme)}
            </View>
          )}

          {!comment.deleted && IssueVisibility.isSecured(comment.visibility) &&
          <CommentVisibility
            style={styles.activityVisibility}
            visibility={IssueVisibility.getVisibilityPresentation(comment.visibility)}
            color={props.uiTheme.colors.$iconAccent}
          />}
        </View>
      </View>
    );
  };

  const renderWorkActivity = (activityGroup: Activity) => (
    <StreamWork
      activityGroup={activityGroup}
      onDelete={props.onWorkDelete}
      onUpdate={props.onWorkUpdate}
    />
  );

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
      isActivityCategory.summary(activity) ||
      isActivityCategory.project(activity)
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
    if (activityGroup?.events?.length > 0) {
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
        ? props.activities.map((activityGroup: Activity, index) => {
          if (activityGroup.hidden) {
            return null;
          }

          const isCommentActivity: boolean = !!activityGroup.comment;
          return (
            <View key={activityGroup.timestamp ? `${activityGroup.timestamp}_${index}` : guid()}>
              {index > 0 && !activityGroup.merged && <View style={styles.activitySeparator}/>}

              <View style={[
                styles.activity,
                activityGroup.merged ? styles.activityMerged : null,
              ]}>

                {renderUserAvatar(activityGroup, !!activityGroup.comment)}

                <View style={styles.activityItem}>
                  {isCommentActivity && renderCommentActivity(activityGroup)}

                  {activityGroup.work && renderWorkActivity(activityGroup)}

                  {renderHistoryAndRelatedChanges(
                    activityGroup,
                    !!activityGroup.comment || !!activityGroup.work,
                    props.uiTheme
                  )}

                  {isCommentActivity && !!props.onSelectReaction && renderCommentActivityReactions(activityGroup)}
                  {isCommentActivity && renderCommentActions(activityGroup)}
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
