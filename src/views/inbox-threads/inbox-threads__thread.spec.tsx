import React from 'react';

import {fireEvent, render} from '@testing-library/react-native';
import {Provider} from 'react-redux';

import mocks from 'test/mocks';

import Thread from './inbox-threads__thread';
import {DEFAULT_THEME} from 'components/theme/theme';
import InboxThreadItemSubscription from './inbox-threads__subscription';
import InboxThreadReaction from './inbox-threads__reactions';
import InboxThreadMention from './inbox-threads__mention';
import {InboxThread, InboxThreadMessage} from 'types/Inbox';
import {Store} from 'redux';
import {useThread} from './inbox-threads__use-thread';

import type {ThreadData} from './inbox-threads__use-thread';

jest.mock('components/swipeable/swipeable');
jest.mock('@expo/react-native-action-sheet', () => ({
  ...jest.requireActual('@expo/react-native-action-sheet'),//https://github.com/jestjs/jest/issues/6914
}));


describe('Inbox Thread', () => {
  let apiMock: Record<string, any>;
  let threadMock: InboxThread;
  let storeMock: Store;
  let networkStateMock: Record<string, any>;

  const getApi = () => apiMock;

  beforeEach(() => {
    networkStateMock = {
      isConnected: true,
    };
    apiMock = {
      inbox: {
        muteToggle: jest.fn().mockResolvedValueOnce(threadMock),
        markThreadRead: jest.fn().mockResolvedValueOnce([null]),
      },
    };
    threadMock = mocks.createThreadMock();
    createStore();
  });

  describe('Render', () => {
    it('should render Thread entity', () => {
      const {getByTestId} = doRender(threadMock);
      expect(getByTestId('test:id/inboxEntity')).toBeTruthy();
    });
    it('should render Thread`s readable id', () => {
      const {getByTestId} = doRender(threadMock);
      expect(getByTestId('test:id/inboxEntityReadableId')).toBeTruthy();
    });

    it('should render Thread`s summary', () => {
      const {getByTestId} = doRender(
        mocks.createThreadMock({
          subject: {
            target: {
              summary: 'text',
            },
          },
        }),
      );

      expect(getByTestId('test:id/inboxEntitySummary')).toBeTruthy();
    });

    it('should render read/unread toggle', () => {
      const {getByTestId} = doRender(threadMock);
      expect(
        getByTestId('test:id/inboxThreadsSubscriptionGroupReadToggle'),
      ).toBeTruthy();
    });


    describe('Thread actions', () => {
      let ActionSheet;
      let showActionSheetWithOptions: jest.MockedFunction<any>;
      beforeEach(() => {
        ActionSheet = require('@expo/react-native-action-sheet');
        showActionSheetWithOptions = jest.fn();
        jest.spyOn(ActionSheet, 'useActionSheet').mockReturnValue({
          showActionSheetWithOptions,
        });
      });

      it('should render action sheet', async () => {
        getActionSheetCallbacksArray(threadMock);
        expect(showActionSheetWithOptions).toHaveBeenCalledTimes(1);
        const actionSheetConfig = showActionSheetWithOptions.mock.calls[0][0];
        expect(actionSheetConfig.title).toEqual(
          `${threadMock.subject.target.idReadable} ${threadMock.subject.target.summary}`,
        );
        expect(actionSheetConfig.options).toEqual([
          'Mute thread',
          'Mark as read',
          'Cancel',
        ]);
      });


      describe('Mute/Unmute', () => {
        it('should mute a thread', () => {
          getActionSheetCallbacksArray(threadMock)(0);
          expect(apiMock.inbox.muteToggle).toHaveBeenCalledWith(
            threadMock.id,
            true,
          );
        });
        it('should unmute a thread', () => {
          threadMock = mocks.createThreadMock({
            muted: true,
          });
          getActionSheetCallbacksArray(threadMock)(0);
          expect(apiMock.inbox.muteToggle).toHaveBeenCalledWith(
            threadMock.id,
            false,
          );
        });
      });


      describe('Read/Unread', () => {
        let message: InboxThreadMessage;
        beforeEach(() => {
          message = threadMock.messages[0];
        });
        it('should mark a thread as read if there is an unread message', () => {
          getActionSheetCallbacksArray({
            ...threadMock,
            messages: [
              {...message, read: false},
              {...message, read: true},
            ],
          })(1);
          expect(apiMock.inbox.markThreadRead).toHaveBeenCalledWith(threadMock.id, threadMock.updated, true);
        });

        it('should mark a thread as unread if there are all messages read', () => {
          getActionSheetCallbacksArray({
            ...threadMock,
            messages: [
              {...message, read: true},
              {...message, read: true},
            ],
          })(1);

          expect(apiMock.inbox.markThreadRead).toHaveBeenCalledWith(threadMock.id, threadMock.updated, false);
        });
      });

      function getActionSheetCallbacksArray(thread: InboxThread) {
        const {getByTestId} = doRender(thread);
        fireEvent.press(getByTestId('test:id/inboxThreadsThreadSettings'));
        return showActionSheetWithOptions.mock.calls[0][1];
      }
    });
  });


  describe('Offline mode', () => {
    beforeEach(() => {
      networkStateMock = {
        isConnected: false,
      };
      createStore();
    });

    it('should disable thread`s settings', async () => {
      const {getByTestId} = doRender(threadMock);
      expect(getByTestId('test:id/inboxThreadsThreadSettings')).toBeDisabled();
      expect(
        getByTestId('test:id/inboxThreadsSubscriptionGroupReadToggle'),
      ).toBeDisabled();
    });
  });


  describe('useThread', () => {
    beforeEach(async () => {
      await mocks.setStorage({mergedNotifications: false});
    });

    function ThreadHookProbe({thread, callback}: {thread: InboxThread; callback: (r: ThreadData) => void}) {
      const {entity, ThreadView, isBottomPositioned} = useThread(thread);
      React.useEffect(() => {
        callback({entity, ThreadView, isBottomPositioned});
      }, [entity, ThreadView, isBottomPositioned, callback]);
      return null;
    }

    it('should create subscription item', async () => {
      threadMock = mocks.createThreadMock({
        id: 'S-thread',
      });
      const fn = jest.fn();
      render(<ThreadHookProbe thread={threadMock} callback={fn} />);
      expect(fn).toHaveBeenCalledWith({
        entity: threadMock.subject.target,
        ThreadView: InboxThreadItemSubscription,
        isBottomPositioned: false,
      });
    });

    it('should create reaction item', async () => {
      threadMock = mocks.createThreadMock({id: 'R-thread'});
      const fn = jest.fn();
      render(<ThreadHookProbe thread={threadMock} callback={fn} />);
      expect(fn).toHaveBeenCalledWith({
        entity: threadMock.subject.target,
        ThreadView: InboxThreadReaction,
        isBottomPositioned: true,
      });
    });

    it('should create mention item', async () => {
      threadMock = mocks.createThreadMock({id: 'M-thread'});
      const fn = jest.fn();
      render(<ThreadHookProbe thread={threadMock} callback={fn} />);
      expect(fn).toHaveBeenCalledWith({
        entity: threadMock.subject.target,
        ThreadView: InboxThreadMention,
        isBottomPositioned: true,
      });
    });
  });


  function doRender(thread: InboxThread) {
    return render(
      <Provider store={storeMock}>
        <Thread
          onNavigate={jest.fn()}
          thread={thread}
          currentUser={mocks.createUserMock()}
          uiTheme={DEFAULT_THEME}
        />
      </Provider>,
    );
  }

  function createStore() {
    storeMock = mocks.createMockStore(getApi)({
      app: {
        networkState: networkStateMock,
      },
      inboxThreads: {
        inProgress: false,
      },
    });
  }
});
