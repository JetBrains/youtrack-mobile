/* @flow */

import React, {useState} from 'react';

import {View, Text, TouchableOpacity} from 'react-native';

import ApiHelper from '../../../components/api/api__helper';
import AttachmentsRow from '../../../components/attachments-row/attachments-row';
import Avatar from '../../../components/avatar/avatar';
import Comment from '../../../components/comment/comment';
import CommentVisibility from '../../../components/comment/comment__visibility';
import CustomFieldChangeDelimiter from '../../../components/custom-field/custom-field__change-delimiter';
import Diff from '../../../components/diff/diff';
import Feature, {FEATURES} from '../../../components/feature/feature';
import getEventTitle from '../../../components/activity/activity__history-title';
import IssueVisibility from '../../../components/visibility/issue-visibility';
import log from '../../../components/log/log';
import ReactionAddIcon from '../../../components/reactions/new-reaction.svg';
import ReactionsPanel from './issue__activity-reactions-dialog';
import Router from '../../../components/router/router';
import usage from '../../../components/usage/usage';
import {
  getEntityPresentation,
  relativeDate,
  getReadableID,
  ytDate
} from '../../../components/issue-formatter/issue-formatter';
import {CommentReactions} from '../../../components/comment/comment-reactions';
import {getApi} from '../../../components/api/api__instance';
import {getTextValueChange} from '../../../components/activity/activity__history-value';
import {IconDrag, IconHistory, IconMoreOptions, IconWork} from '../../../components/icon/icon';
import {isActivityCategory} from '../../../components/activity/activity__category';
import {isIOSPlatform, uuid} from '../../../util/util';
import {minutesAndHoursFor} from '../../../components/time-tracking/time-tracking';
import {SkeletonIssueActivities} from '../../../components/skeleton/skeleton';

import {HIT_SLOP} from '../../../components/common-styles/button';
import {UNIT} from '../../../components/variables/variables';

import styles from './issue-activity.styles';

import type {ActivityItem, IssueActivity} from '../../../flow/Activity';
import type {Attachment, IssueComment} from '../../../flow/CustomFields';
import type {Reaction} from '../../../flow/Reaction';
import type {UITheme} from '../../../flow/Theme';
import type {User} from '../../../flow/User';
import type {WorkTimeSettings} from '../../../flow/WorkTimeSettings';
import type {YouTrackWiki} from '../../../flow/Wiki';

const CATEGORY_NAME = 'Issue Stream';

type Props = {
  activities: Array<IssueActivity> | null,
  attachments: Array<Attachment>,
  commentActions: Object,
  issueFields: Array<Object>,
  issueId: string,
  uiTheme: UITheme,
  workTimeSettings: ?WorkTimeSettings,
  youtrackWiki: $Shape<YouTrackWiki>,
  onReactionSelect: (issueId: string, commentId: string, reactionId: string) => any,
  currentUser: User
};

type Change = {
  added: ActivityItem,
  removed: ActivityItem
};


function IssueActivityStream(props: Props) {
  const [reactionState, setReactionState] = useState({
    isReactionsPanelVisible: false,
    currentComment: null
  });

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

  const renderLinkChange = (activity: IssueActivity) => {
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
                onPress={() => Router.Issue({issueId: readableIssueId})}>
                <Text style={[
                  styles.linkText,
                  linkedIssue.resolved && styles.secondaryTextColor.color,
                  linkedIssue.resolved && styles.activityRemoved
                ]}>
                  {readableIssueId}
                </Text>
                <Text style={[
                  styles.linkText,
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

  const renderCommentActions = (activityGroup: Object) => {
    const comment = firstActivityChange(activityGroup.comment);
    if (!comment) {
      return null;
    }

    const disabled = activityGroup.merged;
    const isAuthor = props.commentActions.isAuthor(comment?.author);

    const canComment: boolean = props.commentActions.canCommentOn;
    const canUpdate: boolean = props.commentActions.canUpdateComment(comment);

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
                onPress={() => isAuthor ? props.commentActions.onStartEditing(comment) : props.commentActions.onReply(comment)}>
                <Text style={styles.link}>
                  {isAuthor ? 'Edit' : 'Reply'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Feature version={FEATURES.reactions}>
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              disabled={disabled}
              onPress={() => setReactionState({
                isReactionsPanelVisible: true,
                currentComment: comment
              })}
            >
              {reactionAddIcon}
            </TouchableOpacity>
          </Feature>

          <TouchableOpacity
            hitSlop={HIT_SLOP}
            disabled={disabled}
            onPress={() => props.commentActions.onShowCommentActions(comment)}>
            {isIOSPlatform()
              ? <IconMoreOptions size={24} color={styles.activityCommentActionsOther.color}/>
              : <IconDrag size={22} color={styles.activityCommentActionsOther.color}/>}
          </TouchableOpacity>
        </View>
      );
    }
  };

  const selectReaction = (comment: IssueComment, reaction: Reaction) => {
    props.onReactionSelect(props.issueId, comment, reaction);
  };

  const renderCommentActivity = (activityGroup: Object) => {
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
            attachments={allAttachments}
            canDeletePermanently={props.commentActions.canDeleteCommentPermanently}
            canRestore={props.commentActions.canRestoreComment(comment)}
            comment={comment}
            key={comment.id}
            onDeletePermanently={() => props.commentActions.onDeleteCommentPermanently(comment, activityGroup.comment.id)}
            onRestore={() => props.commentActions.onRestoreComment(comment)}
            uiTheme={props.uiTheme}
            youtrackWiki={props.youtrackWiki}
          />

          {!comment.deleted && IssueVisibility.isSecured(comment.visibility) &&
          <CommentVisibility
            style={styles.visibility}
            visibility={IssueVisibility.getVisibilityPresentation(comment.visibility)}
            color={styles.iconAccent.color}
          />}
          <CommentReactions
            style={styles.commentReactions}
            comment={comment}
            currentUser={props.currentUser}
            onReactionSelect={selectReaction}
          />

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

  const renderActivityByCategory = (activity: IssueActivity, uiTheme: UITheme) => {
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
      return renderLinkChange(activity);
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

  const hideReactionsPanel = () => setReactionState({isReactionsPanelVisible: false, currentComment: null});


  if (!props.activities) {
    return <SkeletonIssueActivities/>;
  }


  return (
    <View>
      {props.activities.length > 0
        ? props.activities.map((activityGroup, index) => {
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
        : <Text style={styles.activityNoActivity}>No activity yet</Text>}

      {reactionState.isReactionsPanelVisible && (
        <ReactionsPanel
          onSelect={(reaction: Reaction) => {
            hideReactionsPanel();
            selectReaction(reactionState.currentComment, reaction);
          }}
          onHide={hideReactionsPanel}
        />
      )}
    </View>
  );
}


export default React.memo<Props>(IssueActivityStream);
