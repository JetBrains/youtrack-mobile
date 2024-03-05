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
import ApiHelper from 'components/api/api__helper';
import CommentReactions from 'components/comment/comment-reactions';
import ContextActionsProvider from 'components/activity-stream/activity__stream-actions-provider';
import Feature, {FEATURE_VERSION} from 'components/feature/feature';
import IssueVisibility from 'components/visibility/issue-visibility';
import ReactionAddIcon from 'components/reactions/new-reaction.svg';
import StreamComment from './activity__stream-comment';
import StreamHistoryChange from './activity__stream-history';
import StreamTimestamp from './activity__stream-timestamp';
import StreamUserInfo from './activity__stream-user-info';
import StreamVCS from './activity__stream-vcs';
import StreamWork from './activity__stream-work';
import {firstActivityChange} from './activity__stream-helper';
import {getVisibilityPresentation} from 'components/visibility/visibility-helper';
import {guid, isAndroidPlatform} from 'util/util';
import {hasType} from 'components/api/api__resource-types';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {IconLock} from 'components/icon/icon';
import {isDesktop} from 'components/responsive/responsive-helper';
import {menuHeight} from 'components/common-styles/header';
import {useBottomSheetContext} from 'components/bottom-sheet';
import {visibilityArticleDefaultText, visibilityDefaultText} from 'components/visibility/visibility-strings';

import styles from './activity__stream.styles';

import type {ActivityGroup, ActivityItem, ActivityStreamCommentActions} from 'types/Activity';
import type {Attachment, IssueComment} from 'types/CustomFields';
import type {ContextMenuConfig, ContextMenuConfigItem} from 'types/MenuConfig';
import type {CustomError} from 'types/Error';
import type {Reaction} from 'types/Reaction';
import type {UITheme} from 'types/Theme';
import type {User} from 'types/User';
import type {WorkItem, WorkTimeSettings} from 'types/Work';
import type {YouTrackWiki} from 'types/Wiki';
import {Activity} from 'types/Activity';
import {ViewStyleProp} from 'types/Internal';

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
  workTimeSettings?: WorkTimeSettings | null;
  youtrackWiki: YouTrackWiki;
  work?: {
    onWorkUpdate?: (workItem?: WorkItem) => void;
    createContextActions: (workItem: WorkItem | ActivityItem) => ContextMenuConfigItem[];
  };
  onCheckboxUpdate: (checked: boolean, position: number, comment: IssueComment) => void;
  renderHeader?: () => any;
  refreshControl: () => any;
  onUpdate: () => void;
  highlight?: {
    activityId?: string;
    commentId?: string;
  };
  isReporter: boolean;
}

const isAndroidOrDesktop: boolean = isAndroidPlatform() || isDesktop();

export interface ActivityStreamPropsReaction {
  onReactionPanelOpen?: (comment: IssueComment) => void;
  onSelectReaction?: (comment: IssueComment, reaction: Reaction) => void;
}

export type ActivityStreamProps = Props & ActivityStreamPropsReaction;

export const ActivityStream = (props: ActivityStreamProps) => {
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
      const id: string | undefined = highlight?.commentId || highlight?.activityId;
      const layout: LayoutRectangle | undefined = id ? layoutMap.current[id] : undefined;
      if (layout) {
        scrollToActivity(layout);
      }
    }, 100);
  }, [highlight, scrollToActivity]);

  const getCommentFromActivityGroup = (activityGroup: ActivityGroup): IssueComment =>
    firstActivityChange(activityGroup.comment) as IssueComment;

  const renderCommentReactions = (activityGroup: ActivityGroup) => {
    const comment = getCommentFromActivityGroup(activityGroup);
    return comment && !comment.deleted ? (
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
            style={styles.activityCommentActionsAddReaction}
            onPress={() => props?.onReactionPanelOpen?.(comment)}
          >
            <ReactionAddIcon color={styles.activityCommentActionsAddReaction.color}/>
          </TouchableOpacity>
        </Feature>
      </CommentReactions>
    ) : null;
  };

  const onShowContextActions = (
    activityGroup: ActivityGroup,
    menuConfig: ContextMenuConfig = {menuTitle: '', menuItems: []}
  ) => {
    if (!isAndroidOrDesktop) {
      return;
    }
    const activity = activityGroup.comment || activityGroup.work;
    const entity: ActivityItem | undefined = activity && firstActivityChange(activity as Activity);
    if (entity) {
      openBottomSheet({
        withHandle: false,
        header: null,
        children: (
          <>
            {menuConfig.menuItems.map((it: ContextMenuConfigItem) => {
              return (
                <>
                  {it.startBlock && <View style={styles.contextMenuStartBlock} />}
                  <TouchableOpacity
                    key={guid()}
                    style={[styles.contextMenu]}
                    onPress={() => {
                      closeBottomSheet();
                      it.execute();
                    }}
                  >
                    <Text
                      style={[
                        styles.contextMenuItem,
                        it.menuAttributes?.includes('destructive') && styles.contextMenuItemDestructive,
                      ]}
                    >
                      {it.actionTitle}
                    </Text>
                  </TouchableOpacity>
                </>
              );
            })}
          </>
        ),
      });
    }
  };

  const isSecured = (c?: IssueComment): boolean => !!c && IssueVisibility.isSecured(c?.visibility);

  const renderCommentVisibilityPresentation = (
    comment: IssueComment | null,
    style?: ViewStyleProp
  ): React.ReactElement | null => {
    if (comment && IssueVisibility.isSecured(comment.visibility)) {
      const presentation = getVisibilityPresentation(
        comment.visibility!,
        comment.issue ? visibilityDefaultText() : visibilityArticleDefaultText(),
        true
      );
      return (
        <View style={[styles.contextMenuAuxiliaryPreview, style]}>
          <Text style={styles.contextMenuAuxiliaryPreviewText}>
            {i18n('Visible to {{presentation}}', {presentation})}
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderCommentActivity = (activityGroup: ActivityGroup) => {
    const activity = activityGroup.comment!;
    const comment = getCommentFromActivityGroup(activityGroup);
    let attachments: Attachment[] = props.attachments || comment?.attachments || [];
    if (attachments.length) {
      attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(
        attachments,
        props.youtrackWiki.backendUrl,
      );
    }

    const icon = !comment?.deleted && isSecured(comment) ? (
      <IconLock
        testID="test:id/commentVisibilityIcon"
        size={16}
        style={styles.privateIcon}
        color={styles.privateIcon.color}
      />
    ) : null;

    const iconComponent = icon ? (
      isAndroidPlatform() ? (
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          onPress={() => {
            openBottomSheet({
              withHandle: false,
              header: null,
              children: (
                <View style={styles.activityCommentVisibility}>{renderCommentVisibilityPresentation(comment)}</View>
              ),
            });
          }}
        >
          {icon}
        </TouchableOpacity>
      ) : (
        icon
      )
    ) : null;

    return (
      <>
        <View style={styles.activityTitle}>
          {activityGroup.merged ? (
            <>
              <StreamTimestamp
                timestamp={activityGroup.timestamp}
                style={activityGroup.merged && styles.activityTimestampMerged}
              />
              {iconComponent}
            </>
          ) : (
            <StreamUserInfo activityGroup={activityGroup}>{iconComponent}</StreamUserInfo>
          )}
        </View>

        <StreamComment
          onCheckboxUpdate={props.onCheckboxUpdate}
          activity={activity}
          attachments={attachments}
          commentActions={props.commentActions}
          onLongPress={(comment: IssueComment) => {
            props.commentActions?.onLongPress?.(comment, activity.id as string);
            onShowContextActions(activityGroup, props.commentActions?.contextMenuConfig?.(comment, activity.id));
          }}
          youtrackWiki={props.youtrackWiki}
        />
      </>
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
            onLongPress={() => onShowContextActions(
              activityGroup,
              {
                menuTitle: '',
                menuItems: props?.work?.createContextActions?.(firstActivityChange(activityGroup.work)) || [],
              }
            )}
            activityGroup={activityGroup}
            onUpdate={props?.work?.onWorkUpdate}
          />
        );
        break;

      case !!activityGroup.vcs:
        renderedItem = <StreamVCS activityGroup={activityGroup}/>;
    }

    const targetActivityId: string | null | undefined = highlight?.commentId || highlight?.activityId;

    const _comment: IssueComment | null = getCommentFromActivityGroup(activityGroup);

    const activityGroupEvents: Activity[] = getActivityGroupEvents(activityGroup);

    let hasHighlightedActivity: boolean = false;
    if (targetActivityId) {
      const activityGroupId: string = getActivityGroupId(activityGroup);
      hasHighlightedActivity = (
        targetActivityId === activityGroupId ||
        targetActivityId === activityGroupId.split('.')?.[0] ||
       activityGroupEvents.some(it => it.id === targetActivityId) ||
       (!!_comment && _comment.id === highlight?.commentId)
     );
    }

    const Component = hasHighlightedActivity ? Animated.View : View;
    const secured = isSecured(_comment);
    return (
      <>
        <View style={styles.activity}>
          <ActivityUserAvatar
            style={activityGroup.merged && styles.activityAvatarMerged}
            activityGroup={activityGroup}
            showAvatar={!!activityGroup.comment}
          />

          <Component
            style={[
              styles.activityContent,
              secured && styles.activityContentSecured,
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
                    ? [styles.activityRelatedChanges, secured && styles.activityRelatedChangesSecured]
                    : styles.activityHistoryChanges
                }
              >
                {!isRelatedChange && (
                  <>
                    {!activityGroup.merged && <StreamUserInfo activityGroup={activityGroup} />}
                    {activityGroup.merged && (
                      <StreamTimestamp
                        style={styles.activityTimestampMerged}
                        isAbs={true}
                        timestamp={activityGroup.timestamp}
                      />
                    )}
                  </>
                )}

                {activityGroupEvents.map(event => (
                  <StreamHistoryChange key={event.id} activity={event} workTimeSettings={props.workTimeSettings} />
                ))}
              </View>
            )}
            {!!props.onSelectReaction && renderCommentReactions(activityGroup)}
          </Component>
        </View>
      </>
    );
  };

  const addActionsWrapper = (activityGroup: ActivityGroup) => {
    const entity: ActivityItem = firstActivityChange((activityGroup.comment || activityGroup.work) as Activity);
    let menuConfig: ContextMenuConfig | null = null;

    if (activityGroup.comment) {
      menuConfig = props.commentActions?.contextMenuConfig?.(entity as IssueComment, activityGroup?.comment?.id);
    } else if (activityGroup.work && props?.work) {
      menuConfig = {
        menuTitle: '',
        menuItems: props.work.createContextActions(entity),
      };
    }
    const children = doRenderActivity(activityGroup);
    const comment = activityGroup.comment ? entity as IssueComment : null;
    return menuConfig ? (
      <ContextActionsProvider
        auxiliaryPreview={
          !props.isReporter && comment
            ? () => renderCommentVisibilityPresentation(comment, styles.contextMenuAuxiliaryPreviewNarrow)
            : null
        }
        menuConfig={menuConfig}
      >
        {children}
      </ContextActionsProvider>
    ) : (
      <>{children}</>
    );
  };

  const renderActivityGroup = (activityGroup: ActivityGroup, index: number) => {
    if (activityGroup.hidden) {
      return null;
    }
    const _comment: | IssueComment | null = getCommentFromActivityGroup(activityGroup);
    const nextActivity = props?.activities?.[index + 1];
    const prevActivity = props?.activities?.[index - 1];
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
              (it: Activity) => (layoutMap.current[it.id] = event.nativeEvent.layout)
            );
          }
        }}
      >
        {(nextActivity?.merged || (prevActivity?.merged && activityGroup.merged && nextActivity?.merged)) && (
          <View
            style={[styles.activityMergedConnector, !activityGroup?.merged && styles.activityMergedConnectorFirst]}
          />
        )}
        {activityGroup?.merged && <View style={styles.activityMergedLeaf} />}

        {index > 0 && !activityGroup.merged && <View style={styles.activitySeparator} />}

        <View style={[styles.activityWrapper, activityGroup.merged && styles.activityWrapperMerged]}>
          {addActionsWrapper(activityGroup)}
        </View>
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
