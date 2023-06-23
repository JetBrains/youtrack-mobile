import log from 'components/log/log';
import usage from 'components/usage/usage';
import {ANALYTICS_NOTIFICATIONS_THREADS_PAGE} from 'components/analytics/analytics-ids';
import {
  flushStoragePart,
  getStorageState,
  InboxThreadsCache,
} from 'components/storage/storage';
import {folderIdAllKey, folderIdMap} from './inbox-threads-helper';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {INBOX_THREADS_FOLDER_SEEN} from 'actions/action-types';
import {setGlobalInProgress} from 'actions/app-actions';
import {notify, notifyError} from 'components/notification/notification';
import {
  setError,
  setNotifications,
  toggleProgress,
} from './inbox-threads-reducers';
import {until} from 'util/util';

import type Api from 'components/api/api';
import type {AppState} from 'reducers';
import type {CustomError} from 'types/Error';
import type {
  InboxFolder,
  InboxThread,
  InboxThreadMessage,
} from 'types/Inbox';
import type {IssueComment} from 'types/CustomFields';
import type {Reaction} from 'types/Reaction';
import type {User} from 'types/User';
import {Entity} from 'types/Global';
import {ReduxAction} from 'types/Redux';
import {ThreadsStateData} from './inbox-threads-reducers';
import {ThreadsStateFilterId} from 'types/Inbox';

type ApiGetter = () => Api;
type StateGetter = () => AppState;


const MAX_CACHED_THREADS: number = 10;
const DEFAULT_CACHE_DATA = {
  lastVisited: 0,
  unreadOnly: false,
} as InboxThreadsCache;

const trackEvent = (event: string, params?: Record<string, any>) => {
  usage.trackEvent(
    ANALYTICS_NOTIFICATIONS_THREADS_PAGE,
    `Inbox threads: ${event}`,
    params,
  );
};

const getCachedData = (): InboxThreadsCache => getStorageState().inboxThreadsCache || DEFAULT_CACHE_DATA;

const getFolderCachedThreads = (folderId: string = folderIdAllKey): InboxThread[] => {
  const cachedData: InboxThreadsCache = getCachedData();
  return cachedData[folderId as ThreadsStateFilterId] || [];
};

const isOnline = (state: AppState): boolean => state?.app?.networkState?.isConnected === true;

const updateCache = async (data: Record<string, any>): Promise<void> => {
  await flushStoragePart({
    inboxThreadsCache: {...DEFAULT_CACHE_DATA, ...getCachedData(), ...data},
  });
};

const updateThreadsStateAndCache = (
  thread: InboxThread,
  setThreadRead: boolean,
): ReduxAction => {
  return async (
    dispatch: (arg0: any) => any,
    getState: StateGetter,
    getApi: ApiGetter,
  ) => {
    const storedFolderIds: ThreadsStateFilterId[] = [folderIdAllKey, folderIdMap[2]] as ThreadsStateFilterId[];

    if (lastVisitedTabIndex() !== 1) {
      const updatedState: ThreadsStateData = updateState();
      const updatedCacheData: Partial<InboxThreadsCache> = storedFolderIds.reduce(
        (map: Partial<InboxThreadsCache>, folderId: ThreadsStateFilterId) => {
          return Object.assign(
            map,
            updatedState[folderId]
              ? {
                  [folderId]:
                    updatedState[folderId].threads || getCachedData()[folderId],
                }
              : {},
          );
        },
        {},
      );
      updateCache(updatedCacheData);
    }

    function updateState(): ThreadsStateData {
      const unreadOnly: boolean = getCachedData().unreadOnly;
      const threadsData: ThreadsStateData = getState()?.inboxThreads?.threadsData;
      return storedFolderIds.reduce(
        (map: ThreadsStateData, folderId: ThreadsStateFilterId) => {
          let data = {};

          if (threadsData?.[folderId]) {
            const threads: InboxThread[] = threadsData[folderId].threads.reduce(
              (list: InboxThread[], it: InboxThread) =>
                list.concat(
                  thread.id === it.id
                    ? unreadOnly && setThreadRead
                      ? []
                      : unreadOnly
                      ? {
                          ...thread,
                          messages: thread.messages.filter((it: InboxThreadMessage) => !it.read),
                        }
                      : thread
                    : it,
                ),
              [],
            );
            dispatch(
              setNotifications({
                threads,
                reset: true,
                folderId,
              }),
            );
            data = {
              [folderId]: {...threadsData[folderId], threads},
            };
          }

          return {...map, ...data};
        },
        {} as ThreadsStateData,
      );
    }
  };
};

const loadThreadsFromCache = (
  folderId: string = folderIdAllKey,
): ((dispatch: (arg0: any) => any) => Promise<void>) => {
  return async (dispatch: (arg0: any) => any) => {
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
  trackEvent(hasIndex ? 'visit tab' : 'load tab', {
    lastVisited,
  });
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

const saveFolderSeen = (
  folderId: string,
  lastSeen: number,
): ReduxAction => {
  return async (
    dispatch: (arg0: any) => any,
    getState: StateGetter,
    getApi: ApiGetter,
  ) => {
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

const setFolderSeen = (
  folderId?: string,
  date?: number,
): ((
  dispatch: (arg0: any) => any,
  getState: () => any,
  getApi: ApiGetter,
) => Promise<number | null | undefined>) => {
  return async (
    dispatch: (arg0: any) => any,
    getState: StateGetter,
    getApi: ApiGetter,
  ) => {
    const inboxThreadsFolders: InboxFolder[] =
      getState().app?.inboxThreadsFolders || [];
    const lastNotified: number =
      typeof date === 'number'
        ? date
        : folderId
        ? inboxThreadsFolders.find(it => it.id === folderId)?.lastNotified || 0
        : Math.max.apply(
            null,
            inboxThreadsFolders.reduce(
              (numbers: number[], it: InboxFolder) =>
                numbers.concat(
                  it.id === folderIdMap[1] || it.id === folderIdMap[2]
                    ? it.lastNotified
                    : -1,
                ),
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

const markFolderSeen = (
  folderId: string,
  date?: number,
): ReduxAction => {
  return async (
    dispatch: (arg0: any) => any,
    getState: StateGetter,
    getApi: ApiGetter,
  ) => {
    if (!isOnline(getState())) {
      return;
    }

    const lastNotified: number | null | undefined = await dispatch(
      setFolderSeen(folderId, date),
    );

    if (typeof lastNotified === 'number') {
      dispatch(saveFolderSeen(folderId, Math.max(lastNotified, 0)));
    }
  };
};

const setInProgress = (
  inProgress: boolean,
  setGlobalProgress?: boolean,
): ReduxAction => {
  return async (
    dispatch: (arg0: any) => any,
    getState: StateGetter,
    getApi: ApiGetter,
  ) => {
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
  return async (
    dispatch: (arg0: any) => any,
    getState: StateGetter,
    getApi: ApiGetter,
  ) => {
    const reset: boolean = typeof end !== 'number';
    const folderKey: string = folderId || folderIdAllKey;

    if (reset) {
      usage.trackEvent(
        ANALYTICS_NOTIFICATIONS_THREADS_PAGE,
        'Load inbox threads',
      );
    }

    dispatch(setError({error: null}));

    if (!isOnline(getState())) {
      return;
    }

    dispatch(setInProgress(true, setGlobalProgress));
    const [error, threads]: [
      CustomError | null | undefined,
      Array<InboxThread>,
    ] = await until(getApi().inbox.getThreads(folderId, end, isUnreadOnly()));
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
      (folderId === folderIdMap[0] ? [folderIdMap[1], folderIdMap[2]] : [folderId]).forEach(
        (id: string) => {
          dispatch(markFolderSeen(id));
        }
      );
    }
  };
};

const muteToggle = (
  id: string,
  muted: boolean,
): ((
  dispatch: (arg0: any) => any,
  getState: () => any,
  getApi: ApiGetter,
) => Promise<boolean>) => {
  return async (
    dispatch: (arg0: any) => any,
    getState: StateGetter,
    getApi: ApiGetter,
  ) => {
    trackEvent('mute thread', {
      muted,
    });

    if (!isOnline(getState())) {
      return !muted;
    }

    const [error, inboxThread]: [
      CustomError | null | undefined,
      InboxThread,
    ] = await until(getApi().inbox.muteToggle(id, muted));

    if (error) {
      notifyError(error);
      return !muted;
    } else {
      notify(
        inboxThread?.muted === true
          ? i18n('Thread muted')
          : i18n('Thread unmuted'),
      );
      return error ? muted : inboxThread.muted;
    }
  };
};

const readMessageToggle = (
  messages: InboxThreadMessage[],
  read: boolean,
): ReduxAction => {
  return async (
    dispatch: (arg0: any) => any,
    getState: StateGetter,
    getApi: ApiGetter,
  ): Promise<void> => {
    trackEvent('mark message read', {
      read,
    });

    if (!isOnline(getState())) {
      return;
    }

    const [error]: [
      CustomError | null | undefined,
      {
        read: boolean;
      },
    ] = await until(
      getApi().inbox.markMessages(
        messages.map((it: InboxThreadMessage) => ({
          id: it.id,
        })),
        read,
      ),
    );

    if (error) {
      notifyError(error);
    }
  };
};

const markAllAsRead = (
  index: number,
): ReduxAction => {
  return async (
    dispatch: (arg0: any) => any,
    getState: StateGetter,
    getApi: ApiGetter,
  ): Promise<void> => {
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
      const [error]: [
        CustomError | null | undefined,
        {
          read: boolean;
        },
      ] = await until(getApi().inbox.markAllAsRead());
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
): ((
  dispatch: (arg0: any) => any,
  getState: StateGetter,
  getApi: ApiGetter,
) => Promise<void>) => {
  return async (
    dispatch: (arg0: any) => any,
    getState: StateGetter,
    getApi: ApiGetter,
  ): Promise<void> => {
    const currentUser: User = getState().app.user as User;
    trackEvent('Inbox threads: make reaction');
    const reactionName: string = reaction.reaction;
    const existReaction: Reaction = (comment.reactions || []).filter(
      it => it.reaction === reactionName && it.author.id === currentUser.id,
    )[0];
    const entityApi = hasType.article(entity) ? getApi().articles : getApi().issue;
    const [error, response] = await until(
      existReaction
        ? entityApi.removeCommentReaction(
            (entity.id as string),
            comment.id,
            existReaction.id,
          )
        : entityApi.addCommentReaction((entity.id as string), comment.id, reactionName),
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
  readMessageToggle,
  setInProgress,
  toggleUnreadOnly,
  updateThreadsStateAndCache,
};
