import React from 'react';

import {fireEvent, render} from '@testing-library/react-native';
import {Provider} from 'react-redux';

import mocks from '../../../test/mocks';
import Thread from './inbox-threads__thread';
import {DEFAULT_THEME} from 'components/theme/theme';

const threadMuteToggleId = 'test:id/inboxThreadsThreadMuteToggle';

describe('Inbox Thread', () => {
  let apiMock;
  let threadMock;
  let storeMock;
  let networkStateMock;
  const getApi = () => apiMock;
  beforeEach(() => {
    networkStateMock = {isConnected: true};
    apiMock = {
      inbox: {
        muteToggle: jest.fn(),
        markMessages: jest.fn(),
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

    it('should render Thread mute toggle', () => {
      const {getByTestId} = doRender(threadMock);

      expect(getByTestId(threadMuteToggleId)).toBeTruthy();
    });

    it('should render Thread`s readable id', () => {
      const {getByTestId} = doRender(threadMock);

      expect(getByTestId('test:id/inboxEntityReadableId')).toBeTruthy();
    });

    it('should render Thread`s summary', () => {
      const {getByTestId} = doRender(mocks.createThreadMock({subject: {target: {summary: 'text'}}}));

      expect(getByTestId('test:id/inboxEntitySummary')).toBeTruthy();
    });


    describe('Mute/Unmute', () => {
      it('should mute a thread', () => {
        const {getByTestId} = doRender(threadMock);

        fireEvent.press(getByTestId(threadMuteToggleId));

        expect(apiMock.inbox.muteToggle).toHaveBeenCalledWith(threadMock.id, true);
      });

      it('should unmute a thread', () => {
        threadMock = mocks.createThreadMock({muted: true});
        const {getByTestId} = doRender(threadMock);

        fireEvent.press(getByTestId(threadMuteToggleId));

        expect(apiMock.inbox.muteToggle).toHaveBeenCalledWith(threadMock.id, false);
      });

      it('should disable a thread toggle', () => {
        networkStateMock = {isConnected: false};
        createStore();
        const {getByTestId} = doRender(threadMock);

        fireEvent.press(getByTestId(threadMuteToggleId));

        expect(apiMock.inbox.muteToggle).not.toHaveBeenCalled();
      });
    });


    describe('Read/Unread', () => {
      it('should mark a thread as read', () => {
        const {getByTestId} = doRender(threadMock);

        fireEvent.press(getByTestId('test:id/inboxThreadsThreadReadToggle'));

        expect(apiMock.inbox.markMessages).toHaveBeenCalledWith(
          [{id: threadMock.messages[0].id}],
          true,
        );
      });

      it('should mark a thread as unread', () => {
        const {getByTestId} = doRender({
          ...threadMock,
          messages: [{
            ...threadMock.messages[0],
            read: true,
          }],
        });

        fireEvent.press(getByTestId('test:id/inboxThreadsThreadReadToggle'));

        expect(apiMock.inbox.markMessages).toHaveBeenCalledWith(
          [{id: threadMock.messages[0].id}],
          false,
        );
      });

      it('should disable a thread read toggle', () => {
        networkStateMock = {isConnected: false};
        createStore();
        const {getByTestId} = doRender(threadMock);

        fireEvent.press(getByTestId('test:id/inboxThreadsThreadReadToggle'));

        expect(apiMock.inbox.markMessages).not.toHaveBeenCalled();
      });
    });
  });


  function doRender(thread) {
    return render(
      <Provider store={storeMock}>
        <Thread
          thread={thread}
          currentUser={mocks.createUserMock()}
          uiTheme={DEFAULT_THEME}
        />
      </Provider>
    );
  }

  function createStore() {
    storeMock = mocks.createMockStore(getApi)({app: {networkState: networkStateMock}});
  }
});
