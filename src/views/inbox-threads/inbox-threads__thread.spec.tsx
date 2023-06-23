import React from 'react';

import {fireEvent, render} from '@testing-library/react-native';
import {Provider} from 'react-redux';

import mocks from 'test/mocks';

import * as actions from './inbox-threads-actions';
import Thread, {createThreadData} from './inbox-threads__thread';
import {DEFAULT_THEME} from 'components/theme/theme';
import InboxThreadItemSubscription from './inbox-threads__subscription';
import InboxThreadReaction from './inbox-threads__reactions';
import InboxThreadMention from './inbox-threads__mention';
import {InboxThread, InboxThreadMessage} from 'types/Inbox';
import {Store} from 'redux';

jest.mock('components/swipeable/swipeable-row');
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
        markMessages: jest.fn().mockResolvedValueOnce([null]),
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
          expect(apiMock.inbox.markMessages).toHaveBeenCalledWith(
            [
              {
                id: message.id,
              },
              {
                id: message.id,
              },
            ],
            true,
          );
        });

        it('should mark a thread as unread if there are all messages read', () => {
          getActionSheetCallbacksArray({
            ...threadMock,
            messages: [
              {...message, read: true},
              {...message, read: true},
            ],
          })(1);

          expect(apiMock.inbox.markMessages).toHaveBeenCalledWith(
            [
              {
                id: message.id,
              },
              {
                id: message.id,
              },
            ],
            false,
          );
        });

        it('should toggle thread message `read` field', async () => {
          const isRead = true;
          const {getByTestId} = doRender({
            ...threadMock,
            messages: [{...message, read: isRead}],
          });
          fireEvent.press(
            getByTestId('test:id/inboxThreadsSubscriptionGroupReadToggle'),
          );
          await expect(apiMock.inbox.markMessages).toHaveBeenCalledWith(
            [
              {
                id: message.id,
              },
            ],
            !isRead,
          );
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


  describe('getThreadData', () => {
    it('should create subscription item', async () => {
      threadMock = mocks.createThreadMock({
        id: 'S-thread',
      });

      expect(createThreadData(threadMock)).toEqual({
        entity: threadMock.subject.target,
        component: InboxThreadItemSubscription,
        entityAtBottom: false,
      });
    });

    it('should create reaction item', async () => {
      threadMock = mocks.createThreadMock({
        id: 'R-thread',
      });

      expect(createThreadData(threadMock)).toEqual({
        entity: threadMock.subject.target,
        component: InboxThreadReaction,
        entityAtBottom: true,
      });
    });

    it('should create mention item', async () => {
      threadMock = mocks.createThreadMock({
        id: 'M-thread',
      });

      expect(createThreadData(threadMock)).toEqual({
        entity: threadMock.subject.target,
        component: InboxThreadMention,
        entityAtBottom: true,
      });
    });
  });


  describe('Read/Unread', () => {
    beforeEach(() => {
      threadMock = mocks.createThreadMock();
      jest.spyOn(actions, 'readMessageToggle');

    });
    afterEach(() => {
      (actions.readMessageToggle as jest.Mock).mockRestore();
    });

    it('should mark a thread as read', () => {
      const {getByTestId} = doRender(threadMock);
      fireEvent.press(
        getByTestId('test:id/inboxThreadsSubscriptionGroupReadToggle'),
      );

      expect(actions.readMessageToggle).toHaveBeenCalledWith(threadMock.messages, true);
    });

    it('should mark a thread as unread', () => {
      const thread = {...threadMock, messages: [{...threadMock.messages[0], read: true}]};
      const {getByTestId} = doRender(thread);
      fireEvent.press(
        getByTestId('test:id/inboxThreadsSubscriptionGroupReadToggle'),
      );

      expect(actions.readMessageToggle).toHaveBeenCalledWith(thread.messages, false);
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
    });
  }
});
