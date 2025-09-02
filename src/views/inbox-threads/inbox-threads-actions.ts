import log from 'components/log/log';
import usage from 'components/usage/usage';
import {ANALYTICS_NOTIFICATIONS_THREADS_PAGE} from 'components/analytics/analytics-ids';
import {flushStoragePart, getStorageState, InboxThreadsCache} from 'components/storage/storage';
import {folderIdAllKey, folderIdMap} from './inbox-threads-helper';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {INBOX_THREADS_FOLDER_SEEN} from 'actions/action-types';
import {setGlobalInProgress} from 'actions/app-actions';
import {notify, notifyError} from 'components/notification/notification';
import {setError, setNotifications, toggleProgress} from './inbox-threads-reducers';
import {until} from 'util/util';

import type Api from 'components/api/api';
import type {AppState} from 'reducers';
import type {Entity} from 'types/Entity';
import type {InboxFolder, InboxThread} from 'types/Inbox';
import type {IssueComment} from 'types/CustomFields';
import type {Reaction} from 'types/Reaction';
import type {ReduxAction, ReduxAPIGetter, ReduxStateGetter, ReduxThunkDispatch} from 'types/Redux';
import type {ThreadsStateData} from './inbox-threads-reducers';
import type {ThreadsStateFilterId} from 'types/Inbox';
import type {User} from 'types/User';

const MAX_CACHED_THREADS: number = 10;
const DEFAULT_CACHE_DATA = {
  lastVisited: 0,
  unreadOnly: false,
} as InboxThreadsCache;

const trackEvent = (event: string, params?: Object) => {
  usage.trackEvent(ANALYTICS_NOTIFICATIONS_THREADS_PAGE, `Inbox threads: ${event}`, params);
};

const getCachedData = (): InboxThreadsCache => getStorageState().inboxThreadsCache || DEFAULT_CACHE_DATA;

const getFolderCachedThreads = (folderId: ThreadsStateFilterId | null = folderIdAllKey): InboxThread[] => {
  const cachedData: InboxThreadsCache = getCachedData();
  return cachedData[folderId as ThreadsStateFilterId] || [];
};

const isOnline = (state: AppState): boolean => state?.app?.networkState?.isConnected === true;

const updateCache = async (data: Record<string, any>) => {
  await flushStoragePart({
    inboxThreadsCache: {...DEFAULT_CACHE_DATA, ...getCachedData(), ...data},
  });
};

const updateThreadsStateAndCache = (thread: InboxThread): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const storedFolderIds: ThreadsStateFilterId[] = [folderIdAllKey, folderIdMap[1], folderIdMap[2]] as ThreadsStateFilterId[];

    const updatedState: ThreadsStateData = updateState();
    const updatedCacheData: Partial<InboxThreadsCache> = storedFolderIds.reduce(
      (map: Partial<InboxThreadsCache>, folderId: ThreadsStateFilterId) => {
        return Object.assign(
          map,
          updatedState[folderId]
            ? {
                [folderId]: updatedState[folderId].threads || getCachedData()[folderId],
              }
            : {},
        );
      },
      {},
    );
    updateCache(updatedCacheData);

    function updateState(): ThreadsStateData {
      const threadsData = getState()?.inboxThreads?.threadsData;
      return storedFolderIds.reduce((map: ThreadsStateData, folderId: ThreadsStateFilterId) => {
        let data = {};

        if (threadsData?.[folderId]) {
          const updatedThreads = threadsData[folderId].threads.map((it: InboxThread) => {
            return thread.id === it.id ? thread : it;
          }, []);

          let threads: InboxThread[];
          if (getCachedData().unreadOnly) {
            threads = updatedThreads.map((t: InboxThread) => {
              return {...t, messages: t.messages.filter(m => !m.read)};
            });
          } else {
            threads = updatedThreads;
          }

          dispatch(setNotifications({threads, reset: true, folderId}));
          data = {[folderId]: {...threadsData[folderId], threads: updatedThreads}};
        }

        return {...map, ...data};
      }, {} as ThreadsStateData);
    }
  };
};

const loadThreadsFromCache = (folderId: ThreadsStateFilterId | null = folderIdAllKey): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch) => {
    const cachedThreads: InboxThread[] = getFolderCachedThreads(folderId);

    if (cachedThreads?.length) {
      dispatch(
        setNotifications({
          threads: cachedThreads,
          reset: true,
          folderId,
        }),
      );
    }
  };
};

const lastVisitedTabIndex = (index?: number): number | undefined => {
  const hasIndex: boolean = typeof index === 'number';

  if (hasIndex) {
    updateCache({
      lastVisited: index,
    });
  }

  const lastVisited: number | undefined = hasIndex ? index : getCachedData().lastVisited;
  trackEvent(hasIndex ? 'visit tab' : 'load tab', {lastVisited});
  return lastVisited;
};

const toggleUnreadOnly = async (): Promise<void> => {
  const inboxThreadsCache: InboxThreadsCache = getCachedData();
  trackEvent('set unreadOnly', {
    unreadOnly: !inboxThreadsCache.unreadOnly,
  });
  await updateCache({
    unreadOnly: !inboxThreadsCache.unreadOnly,
  });
};

const isUnreadOnly = (): boolean => getCachedData().unreadOnly === true;

const saveFolderSeen = (folderId: string, lastSeen: number): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const all: boolean = folderId === folderIdMap[0];
    trackEvent('mark folder seen', {
      all,
    });

    if (isOnline(getState())) {
      const api: Api = getApi();
      const [error] = await until(
        all
          ? api.inbox.saveAllAsSeen(lastSeen)
          : api.inbox.updateFolders(folderId, {
              lastSeen,
            }),
      );

      if (error) {
        log.warn(error);
      }
    }
  };
};

const setFolderSeen = (folderId?: string, date?: number): ReduxAction<Promise<number | null | undefined>> => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const inboxThreadsFolders: InboxFolder[] = getState().app?.inboxThreadsFolders || [];
    const lastNotified: number =
      typeof date === 'number'
        ? date
        : folderId
        ? inboxThreadsFolders.find(it => it.id === folderId)?.lastNotified || 0
        : Math.max.apply(
            null,
            inboxThreadsFolders.reduce(
              (numbers: number[], it: InboxFolder) =>
                numbers.concat(it.id === folderIdMap[1] || it.id === folderIdMap[2] ? it.lastNotified : -1),
              [0],
            ),
          );

    if (typeof lastNotified === 'number') {
      dispatch({
        type: INBOX_THREADS_FOLDER_SEEN,
        folderId,
        lastSeen: lastNotified,
      });
    }

    return lastNotified;
  };
};

const markFolderSeen = (folderId: string, date?: number): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    if (!isOnline(getState())) {
      return;
    }

    const lastNotified = await dispatch(setFolderSeen(folderId, date));

    if (typeof lastNotified === 'number') {
      dispatch(saveFolderSeen(folderId, Math.max(lastNotified, 0)));
    }
  };
};

const setInProgress = (inProgress: boolean, setGlobalProgress?: boolean): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch) => {
    dispatch(toggleProgress({inProgress}));

    if (setGlobalProgress) {
      dispatch(setGlobalInProgress(inProgress));
    }
  };
};

const loadInboxThreads = (
  folderId?: ThreadsStateFilterId | null,
  end?: number,
  setGlobalProgress: boolean = false,
): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const reset: boolean = typeof end !== 'number';
    const folderKey: ThreadsStateFilterId = folderId || folderIdAllKey;

    if (reset) {
      usage.trackEvent(ANALYTICS_NOTIFICATIONS_THREADS_PAGE, 'Load inbox threads');
    }

    dispatch(setError({error: null}));

    if (!isOnline(getState())) {
      return;
    }

    dispatch(setInProgress(true, setGlobalProgress));
    const [error, threads] = await until<InboxThread[]>(getApi().inbox.getThreads(folderId, end, isUnreadOnly()));
    dispatch(setInProgress(false, setGlobalProgress));

    if (error) {
      dispatch(setError({error}));
    } else {
      doMarkSeen();
      dispatch(
        setNotifications({
          threads,
          reset,
          folderId: folderKey,
        }),
      );
      await updateCache({
        [folderId || folderIdAllKey]: threads.slice(0, MAX_CACHED_THREADS),
      });
    }

    async function doMarkSeen() {
      (folderId === folderIdMap[0] ? [folderIdMap[1], folderIdMap[2]] : [folderId]).forEach((id: string) => {
        dispatch(markFolderSeen(id));
      });
    }
  };
};

const muteToggle = (id: string, muted: boolean): ReduxAction<Promise<boolean>> => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    trackEvent('mute thread', {
      muted,
    });

    if (!isOnline(getState())) {
      return !muted;
    }

    const [error, inboxThread] = await until<InboxThread>(getApi().inbox.muteToggle(id, muted));

    if (error) {
      notifyError(error);
      return !muted;
    } else {
      notify(inboxThread?.muted === true ? i18n('Thread muted') : i18n('Thread unmuted'));
      return error ? muted : inboxThread.muted;
    }
  };
};

const updateThreadRead = (id: string, updated: number, read: boolean): ReduxAction => {
  return async (_: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    trackEvent('mark thread read', {read});
    if (!isOnline(getState())) {
      return;
    }
    const [error] = await until<boolean>(getApi().inbox.markThreadRead(id, updated, read));
    if (error) {
      notifyError(error);
    }
  };
};

const markAllAsRead = (index: number): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter): Promise<void> => {
    trackEvent('Inbox threads: mark all as read');

    if (isOnline(getState())) {
      dispatch(toggleProgress({inProgress: true}));
      dispatch(
        setNotifications({
          threads: [],
          reset: true,
          folderId: folderIdMap[index],
        }),
      );
      const [error] = await until(getApi().inbox.markAllAsRead());
      dispatch(
        toggleProgress({
          inProgress: false,
        }),
      );

      if (error) {
        notifyError(error);
      } else {
        notify(i18n('Marked as read'));
      }
    }
  };
};

const onReactionSelect = (
  entity: Entity,
  comment: IssueComment,
  reaction: Reaction,
  onAfterSelect: (...args: any[]) => any,
): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter): Promise<void> => {
    const currentUser: User = getState().app.user as User;
    trackEvent('Inbox threads: make reaction');
    const reactionName: string = reaction.reaction;
    const existReaction: Reaction = (comment.reactions || []).filter(
      it => it.reaction === reactionName && it.author.id === currentUser.id,
    )[0];
    const entityApi = hasType.article(entity) ? getApi().articles : getApi().issue;
    const [error, response] = await until(
      existReaction
        ? entityApi.removeCommentReaction(entity.id as string, comment.id, existReaction.id)
        : entityApi.addCommentReaction(entity.id as string, comment.id, reactionName),
    );

    if (error) {
      notifyError(error);
    } else {
      dispatch(markFolderSeen(folderIdMap[1], Date.now()));
      onAfterSelect(existReaction ? null : response, !!existReaction);
    }
  };
};

export {
  getFolderCachedThreads,
  isUnreadOnly,
  lastVisitedTabIndex,
  loadInboxThreads,
  loadThreadsFromCache,
  markAllAsRead,
  saveFolderSeen,
  markFolderSeen,
  muteToggle,
  onReactionSelect,
  setInProgress,
  toggleUnreadOnly,
  updateThreadsStateAndCache,
  updateThreadRead,
};
