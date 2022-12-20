import * as types from './inbox-action-types';
import log from 'components/log/log';
import usage from 'components/usage/usage';
import {ANALYTICS_NOTIFICATIONS_PAGE} from 'components/analytics/analytics-ids';
import {checkVersion, FEATURE_VERSION} from 'components/feature/feature';
import {flushStoragePart, getStorageState} from 'components/storage/storage';
import {sortByTimestampReverse} from 'components/search/sorting';
import {until} from 'util/util';
import type Api from 'components/api/api';
import type {AppState} from '../../reducers';
import type {CustomError} from 'types/Error';
import type {IssueLinkType} from '../../types/CustomFields';
import type {Notification} from 'types/Inbox';
type ApiGetter = () => Api;
export function setLoading(
  loading: boolean,
): {
  loading: boolean;
  type: any;
} {
  return {
    type: types.SET_LOADING,
    loading,
  };
}
export function addItems(
  items: Array<Record<string, any>>,
  hasMore: boolean,
  issueLinkTypes: Record<string, Partial<IssueLinkType>>,
): {
  hasMore: boolean;
  items: any[];
  type: any;
  issueLinkTypes: Record<string, string>;
} {
  return {
    type: types.ADD_ITEMS,
    items,
    hasMore,
    issueLinkTypes,
  };
}
export function resetItems(): {
  type: any;
} {
  return {
    type: types.RESET_ITEMS,
  };
}
export function listEndReached(): {
  type: any;
} {
  return {
    type: types.LIST_END_REACHED,
  };
}
export function setError(
  error: CustomError | null | undefined,
): {
  error: CustomError | null | undefined;
  type: any;
} {
  return {
    type: types.ERROR,
    error,
  };
}

const loadInboxCache = (): ((
  dispatch: (arg0: any) => any,
) => Promise<void>) => {
  return async (dispatch: (arg0: any) => any) => {
    const inboxCache: Notification[] | null = getStorageState().inboxCache;

    if (inboxCache) {
      dispatch(addItems(inboxCache, false, {}));
    }
  };
};

const loadInbox = (
  skip: number = 0,
  top: number = 10,
): ((
  dispatch: (arg0: any) => any,
  getState: () => any,
  getApi: ApiGetter,
) => Promise<void> | Promise<any>) => {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    const isOffline: boolean =
      getState().app?.networkState?.isConnected === false;

    if (isOffline) {
      return;
    }

    const api = getApi();
    dispatch(setError(null));
    dispatch(setLoading(true));
    const loadingErrorMessage: string = 'Cannot load Inbox.';
    const promises = [api.inbox.getInbox(skip, top)];
    const isReactionsAvailable: boolean = checkVersion(
      FEATURE_VERSION.reactions,
    );

    if (isReactionsAvailable) {
      usage.trackEvent(ANALYTICS_NOTIFICATIONS_PAGE, 'Loading reaction feed');
      promises.push(api.user.reactionsFeed(skip, top));
    }

    promises.push(api.issue.getIssueLinkTypes());
    const [error, response] = await until(promises);

    if (error || response.filter(Boolean).length === 0) {
      const err: CustomError = error || new Error(loadingErrorMessage);
      log.warn(loadingErrorMessage, err);
      return dispatch(setError(err));
    }

    const notifications = (response[0] || [])
      .filter(item => item.metadata)
      .map(it =>
        Object.assign(
          {},
          it,
          it?.metadata?.change?.startTimestamp
            ? {
                timestamp: it.metadata.change.startTimestamp,
              }
            : {},
        ),
      );
    const reactions = isReactionsAvailable ? response && response[1] : [];
    const sortedByTimestampItems = notifications
      .concat(reactions)
      .sort(sortByTimestampReverse);
    const issueLinkTypes: Record<string, string> = (
      response[isReactionsAvailable ? 2 : 1] || []
    ).reduce(
      (map: Record<string, Partial<IssueLinkType>>, ilt: IssueLinkType) => {
        if (ilt.localizedSourceToTarget) {
          map[ilt.sourceToTarget.toLowerCase()] = ilt.localizedSourceToTarget;
        }

        if (ilt.localizedTargetToSource) {
          map[ilt.targetToSource.toLowerCase()] = ilt.localizedTargetToSource;
        }

        return map;
      },
      {},
    );

    if (!skip) {
      dispatch(resetItems());
    }

    dispatch(
      addItems(sortedByTimestampItems, response[0].length > 0, issueLinkTypes),
    );
    flushStoragePart({
      inboxCache: sortedByTimestampItems,
    });

    if (response[0].length < top) {
      dispatch(listEndReached());
    }

    dispatch(setLoading(false));
  };
};

export {loadInbox, loadInboxCache};
