import React, {MutableRefObject, useCallback, useLayoutEffect, useRef} from 'react';
import {
  Animated,
  LayoutRectangle,
  NativeScrollEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import ActivityUserAvatar from './activity__stream-avatar';
import ApiHelper from '../api/api__helper';
import CommentReactions from 'components/comment/comment-reactions';

import ContextMenu from 'components/context-menu/context-menu';
import Feature, {FEATURE_VERSION} from '../feature/feature';
import ReactionAddIcon from 'components/reactions/new-reaction.svg';
import StreamComment from './activity__stream-comment';
import StreamHistoryChange from './activity__stream-history';
import StreamTimestamp from './activity__stream-timestamp';
import StreamUserInfo from './activity__stream-user-info';
import StreamVCS from './activity__stream-vcs';
import StreamWork from './activity__stream-work';
import {firstActivityChange} from './activity__stream-helper';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {guid, isAndroidPlatform} from 'util/util';
import {hasType} from 'components/api/api__resource-types';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {menuHeight} from 'components/common-styles/header';
import {useBottomSheetContext} from 'components/bottom-sheet';

import styles from './activity__stream.styles';

import type {ActivityGroup, ActivityStreamCommentActions} from 'types/Activity';
import type {Attachment, IssueComment} from 'types/CustomFields';
import type {ContextMenuConfig, ContextMenuConfigItem} from 'types/MenuConfig';
import type {CustomError} from 'types/Error';
import type {Reaction} from 'types/Reaction';
import type {UITheme} from 'types/Theme';
import type {User} from 'types/User';
import type {WorkItem, WorkTimeSettings} from 'types/Work';
import type {YouTrackWiki} from 'types/Wiki';
import {Activity} from 'types/Activity';

interface Props {
  activities: ActivityGroup[] | null;
  attachments: Attachment[];
  commentActions: ActivityStreamCommentActions;
  currentUser: User;
  issueFields?: Array<Record<string, any>>;
  onReactionSelect?: (
    issueId: string,
    comment: IssueComment,
    reaction: Reaction,
    activities: Activity[],
    onReactionUpdate: (
      activities: Activity[],
      error?: CustomError,
    ) => void,
  ) => any;
  uiTheme: UITheme;
  workTimeSettings: WorkTimeSettings | null | undefined;
  youtrackWiki: YouTrackWiki;
  onWorkDelete?: (workItem: WorkItem) => any;
  onWorkUpdate?: (workItem?: WorkItem) => void;
  onWorkEdit?: (workItem: WorkItem) => void;
  onCheckboxUpdate: (checked: boolean, position: number, comment: IssueComment) => void;
  renderHeader?: () => any;
  refreshControl: () => any;
  highlight?: {
    activityId: string;
    commentId?: string;
  };
}

const isAndroid: boolean = isAndroidPlatform();

export interface ActivityStreamPropsReaction {
  onReactionPanelOpen?: (comment: IssueComment) => void;
  onSelectReaction?: (comment: IssueComment, reaction: Reaction) => void;
}

export type ActivityStreamProps = Props & ActivityStreamPropsReaction;

export const ActivityStream: React.FC<ActivityStreamProps> = (props: ActivityStreamProps) => {
  const window = useWindowDimensions();
  const {
    renderHeader = () => null,
    activities,
    highlight,
  } = props;

  const {openBottomSheet, closeBottomSheet} = useBottomSheetContext();

  const onScroll = ({nativeEvent}: { nativeEvent: NativeScrollEvent }) => (
    scrollOffset.current = nativeEvent.contentOffset.y
  );

  const scrollRef: MutableRefObject<ScrollView | null> = useRef(null);
  const scrollOffset: MutableRefObject<number> = useRef(0);
  const bgColor = useRef(new Animated.Value(0));
  const color = useRef(
    bgColor.current.interpolate({
      inputRange: [0, 300],
      outputRange: [styles.activityHighlighted.backgroundColor, 'transparent'],
    }),
  );
  const layoutMap: MutableRefObject<{ [key: string]: LayoutRectangle | undefined }> = useRef({});
  const scrollToActivity = useCallback(
    (layout: LayoutRectangle) => {
      if (
        scrollRef.current?.scrollTo &&
        (layout.y < scrollOffset.current ||
          layout.y > window.height ||
          layout.y + layout.height > window.height - menuHeight * 5)
      ) {
        scrollRef.current.scrollTo({
          y: layout.y,
          animated: true,
        });
      }
    },
    [window.height],
  );

  useLayoutEffect(() => {
    bgColor.current.setValue(0);
    Animated.timing(bgColor.current, {
      toValue: 300,
      duration: 3000,
      useNativeDriver: false,
    }).start();
  }, [highlight]);

  useLayoutEffect(() => {
    setTimeout(() => {
      const layout: LayoutRectangle | undefined = layoutMap.current[highlight!.commentId || highlight!.activityId];
      if (layout) {
        scrollToActivity(layout);
      }
    }, 100);
  }, [highlight, scrollToActivity]);

  const getCommentFromActivityGroup = (activityGroup: ActivityGroup): IssueComment | null => (
    firstActivityChange(activityGroup.comment) as (IssueComment | null)
  );

  const renderCommentReactions = (activityGroup: ActivityGroup): React.ReactNode => {
    const comment: IssueComment | null = getCommentFromActivityGroup(activityGroup);
    return comment && !comment.deleted ? (
      <View style={styles.activityCommentReactions}>
        <CommentReactions
          style={styles.activityCommentReactions}
          comment={comment}
          currentUser={props.currentUser}
          onReactionSelect={props.onSelectReaction}
        >
          <Feature
            version={hasType.articleComment(comment) ? FEATURE_VERSION.articleReactions : FEATURE_VERSION.reactions}
          >
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              onPress={() => props?.onReactionPanelOpen?.(comment)}
            >
              <ReactionAddIcon style={styles.activityCommentActionsAddReaction}/>
            </TouchableOpacity>
          </Feature>
        </CommentReactions>
      </View>
    ) : null;
  };

  const getMenuConfig = (
    commentActions: ActivityStreamCommentActions,
    comment: IssueComment,
    activityId: string
  ): ContextMenuConfig => (
    commentActions?.contextMenuConfig?.(comment, activityId) || {menuTitle: '', menuItems: []}
  );

  const renderBottomSheetContent = (activityGroup: ActivityGroup, activityId: string): React.ReactNode => {
    const comment: IssueComment = getCommentFromActivityGroup(activityGroup) as IssueComment;
    return (
      <>
        {getMenuConfig(props.commentActions, comment, activityId).menuItems.map(
          (it: ContextMenuConfigItem) => (
            <TouchableOpacity
              key={guid()}
              style={styles.contextMenu}
              onPress={() => {
                closeBottomSheet();
                it?.execute?.();
              }}
            >
              <Text
                style={[
                  styles.contextMenuItem,
                  it.menuAttributes?.includes('destructive') && styles.contextMenuItemDestructive,
                ]}>
                {it.actionTitle}
              </Text>
            </TouchableOpacity>
          )
        )}
      </>
    );
  };

  const renderCommentActivity = (activityGroup: ActivityGroup) => {
    const activity: Activity = activityGroup.comment as Activity;

    const _attachments: Attachment[] =
      props.attachments || (firstActivityChange(activity) as IssueComment)?.attachments || [];

    const attachments: Attachment[] = ApiHelper.convertAttachmentRelativeToAbsURLs(
      _attachments,
      props.youtrackWiki.backendUrl,
    );
    return (
      <>
        {activityGroup.merged ? (
          <StreamTimestamp
            timestamp={activityGroup.timestamp}
            style={styles.activityCommentDate}
          />
        ) : (
          <StreamUserInfo activityGroup={activityGroup}/>
        )}
        <StreamComment
          activity={activity}
          attachments={attachments}
          commentActions={props.commentActions}
          onLongPress={(comment: IssueComment) => {
            props.commentActions?.onLongPress?.(comment, activity.id as string);
            if (isAndroid) {
              const comment: IssueComment = getCommentFromActivityGroup(activityGroup) as IssueComment;
              openBottomSheet({
                children: renderBottomSheetContent(activityGroup, activity.id),
                snapPoint: 1,
                header: (
                  <ScrollView
                    style={[styles.contextMenuTitle, styles.contextMenuTitleItem]}
                  >
                    <Text style={styles.contextMenuTitleItem}>{getEntityPresentation(comment?.author)}</Text>
                    <Text style={styles.contextMenuTitleItem} selectable={true}>
                      {comment.text}
                    </Text>
                  </ScrollView>
                ),
              });
            }
          }}
          youtrackWiki={props.youtrackWiki}
        />
        {!!props.onSelectReaction && renderCommentReactions(activityGroup)}
      </>
    );
  };

  const ContextActionsProvider = ({children, comment, activityId}: {
    children: React.ReactNode,
    comment: IssueComment,
    activityId: string
  }) => {
    const {commentActions} = props;
    const menuConfig: ContextMenuConfig = getMenuConfig(commentActions, comment, activityId);
    return (
      <ContextMenu
        menuConfig={menuConfig}
        onPress={(actionKey: string) => {
          const targetItem: ContextMenuConfigItem | undefined = menuConfig.menuItems.find(
            (it: ContextMenuConfigItem) => it.actionKey === actionKey
          );
          targetItem?.execute?.();
        }}
      >
        {children}
      </ContextMenu>
    );
  };

  const getActivityGroupEvents = (activityGroup: ActivityGroup) => activityGroup?.events || [];

  const getActivityGroupId = (activityGroup: ActivityGroup) => (
    activityGroup?.comment?.id ||
    activityGroup?.work?.id ||
    activityGroup?.vcs?.id ||
    getActivityGroupEvents(activityGroup)[0]?.id
  );

  const doRenderActivity = (activityGroup: ActivityGroup) => {
    const isRelatedChange: boolean = Boolean(
      activityGroup?.comment || activityGroup?.work || activityGroup?.vcs,
    );
    let renderedItem: any = null;

    switch (true) {
      case !!activityGroup.comment:
        renderedItem = renderCommentActivity(activityGroup);
        break;

      case !!activityGroup.work:
        renderedItem = (
          <StreamWork
            activityGroup={activityGroup}
            onDelete={props.onWorkDelete}
            onUpdate={props.onWorkUpdate}
            onEdit={props.onWorkEdit}
          />
        );
        break;

      case !!activityGroup.vcs:
        renderedItem = <StreamVCS activityGroup={activityGroup}/>;
    }

    const targetActivityId: string | null | undefined = highlight?.commentId || highlight?.activityId;

    const _comment: IssueComment | null = getCommentFromActivityGroup(activityGroup);

    const activityGroupEvents: Activity[] = getActivityGroupEvents(activityGroup);
    const hasHighlightedActivity: boolean = (
      !!targetActivityId && (getActivityGroupId(activityGroup) === targetActivityId ||
        activityGroupEvents.some(it => it.id === targetActivityId) ||
        (!!_comment && _comment.id === highlight?.commentId))
    );

    const Component = hasHighlightedActivity ? Animated.View : View;
    return (
      <View
        style={[
          styles.activity,
          activityGroup.merged && !activityGroup.comment
            ? styles.activityMerged
            : null,
        ]}
      >
        <ActivityUserAvatar
          activityGroup={activityGroup}
          showAvatar={!!activityGroup.comment}
        />

        <Component
          style={[
            styles.activityItem,
            hasHighlightedActivity && {
              backgroundColor: color.current,
            },
          ]}
        >
          {renderedItem}
          {activityGroupEvents.length > 0 && (
            <View
              style={
                isRelatedChange
                  ? styles.activityRelatedChanges
                  : styles.activityHistoryChanges
              }
            >
              {Boolean(!activityGroup.merged && !isRelatedChange) && (
                <StreamUserInfo activityGroup={activityGroup}/>
              )}
              {activityGroup.merged && (
                <StreamTimestamp
                  isAbs={true}
                  timestamp={activityGroup.timestamp}
                />
              )}

              {activityGroupEvents.map(event => (
                <StreamHistoryChange
                  key={event.id}
                  activity={event}
                  workTimeSettings={props.workTimeSettings}
                />
              ))}
            </View>
          )}
        </Component>
      </View>
    );
  };

  const renderActivityGroup = (activityGroup: ActivityGroup, index: number) => {
    if (activityGroup.hidden) {
      return null;
    }
    const _comment: | IssueComment | null = getCommentFromActivityGroup(activityGroup);
    const Wrapper: any = _comment ? ContextActionsProvider : React.Fragment;
    return (
      <View
        key={`${index}-${activityGroup.id}`}
        onLayout={event => {
          if (activities?.length) {
            layoutMap.current[getActivityGroupId(activityGroup)] = event.nativeEvent.layout;

            if (_comment?.id) {
              layoutMap.current[_comment.id] = event.nativeEvent.layout;
            }

            getActivityGroupEvents(activityGroup).forEach(
              (it: Activity) =>
                (layoutMap.current[it.id] = event.nativeEvent.layout),
            );
          }
        }}
      >
        {index > 0 && !activityGroup.merged && (
          <View style={styles.activitySeparator}/>
        )}
        <Wrapper {...(_comment && {
          comment: getCommentFromActivityGroup(activityGroup),
          activityId: activityGroup?.comment?.id,
        })}>
          {doRenderActivity(activityGroup)}
        </Wrapper>
      </View>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.activityStream}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={16}
      refreshControl={props.refreshControl()}
      ref={instance => instance != null && (scrollRef.current = instance)}
      onScroll={onScroll}
    >
      {renderHeader()}
      {(activities || []).map(renderActivityGroup)}
      {activities?.length === 0 && (
        <Text style={styles.activityNoActivity}>{i18n('No activity yet')}</Text>
      )}
    </ScrollView>
  );
};

export default ActivityStream;
