import React from 'react';

import {render} from '@testing-library/react-native';

import InboxThreads from './inbox-threads';
import mocks from '../../../test/mocks';
import {buildStyles, DEFAULT_THEME} from 'components/theme/theme';
import {Provider} from 'react-redux';
import {ThemeContext} from 'components/theme/theme-context';


describe('Inbox Threads', () => {
  beforeAll(() => buildStyles(DEFAULT_THEME.mode, DEFAULT_THEME));

  let storeMock;

  beforeAll(() => {
    createStore();
  });

  describe('Render', () => {
    it('should render Inbox Threads view', () => {
      const {getByTestId} = doRender();

      expect(getByTestId('test:id/inboxThreads')).toBeTruthy();
    });

    it('should render thread item', () => {
      createStore([mocks.createThreadMock()]);
      const {getByTestId} = doRender();

      expect(getByTestId('test:id/inboxThreadsThread')).toBeTruthy();
    });
  });


  function createStore(threads = []) {
    let apiMock;
    const getApi = () => apiMock;
    const createStoreMock = mocks.createMockStore(getApi);
    const stateMock = {
      app: {
        otherAccounts: [],
      },
      inboxThreads: {
        threads,
      },
    };
    storeMock = createStoreMock(stateMock);
  }

  function doRender() {
    return render(
      <Provider store={storeMock}>
        <ThemeContext.Provider
          value={{
            mode: 'light',
            uiTheme: DEFAULT_THEME,
            setMode: () => null,
          }}
        >
          <InboxThreads/>
        </ThemeContext.Provider>
      </Provider>,
    );
  }

});
