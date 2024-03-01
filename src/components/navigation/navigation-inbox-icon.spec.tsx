import React from 'react';
import {Provider} from 'react-redux';

import {render, cleanup, fireEvent} from '@testing-library/react-native';

import * as appActions from 'actions/app-actions';
import mocks from 'test/mocks';
import NavigationInboxIcon, {menuPollInboxStatusDelay} from './navigation-inbox-icon';

jest.mock('../feature/feature');
jest.mock('./navigation-icon');


const createStoreMock = mocks.createMockStore({});
describe('<NavigationInboxIcon/>', () => {
  let storeMock: any;

  beforeEach(() => {
    jest.restoreAllMocks();
    storeMock = createStoreMock({
      app: {
        auth: {},
        inboxThreadsFolders: [],
        isChangingAccount: false,
        otherAccounts: [],
        user: {},
      },
    }, {});
  });
  afterEach(cleanup);


  describe('Inbox status polling', () => {
    beforeAll(() => {
      jest.useFakeTimers({advanceTimers: true});
    });
    afterAll(() => {
      jest.useRealTimers();
    });
    beforeEach(() => {
      jest.spyOn(appActions, 'inboxCheckUpdateStatus');
    });


    describe('Inbox threads is available', () => {
      beforeEach(() => {
        const feature = require('components/feature/feature');
        feature.checkVersion.mockReturnValue(true);
      });

      it('should start polling without waiting', () => {
        const {getByTestId} = doRender({});
        fireEvent.press(getByTestId('test:id/menuIssuesInboxIcon'));

        expect(appActions.inboxCheckUpdateStatus).toHaveBeenCalledTimes(1);
      });

      it('should poll status', async () => {
        const {getByTestId} = doRender({});
        fireEvent.press(getByTestId('test:id/menuIssuesInboxIcon'));
        jest.advanceTimersByTime(menuPollInboxStatusDelay);

        expect(appActions.inboxCheckUpdateStatus).toHaveBeenCalledTimes(2);
      });

      it('should not stop polling status inside inbox threads', async () => {
        const {getByTestId} = doRender({});
        fireEvent.press(getByTestId('test:id/menuIssuesInboxIcon'));
        jest.advanceTimersByTime(menuPollInboxStatusDelay);

        expect(appActions.inboxCheckUpdateStatus).toHaveBeenCalled();
      });
    });


    describe('Inbox threads unavailable', () => {
      beforeEach(() => {
        const feature = require('../feature/feature');
        feature.checkVersion.mockReturnValue(false);
      });

      it('should not poll status if the feature is unavailable', () => {
        const {getByTestId} = doRender({});
        fireEvent.press(getByTestId('test:id/menuIssuesInboxIcon'));
        jest.advanceTimersByTime(menuPollInboxStatusDelay);

        expect(appActions.inboxCheckUpdateStatus).not.toHaveBeenCalled();
      });
    });
  });

  function doRender({color = 'red', size = 20}: { color?: string; size?: number }) {
    return render(
      <Provider store={storeMock}>
        <NavigationInboxIcon
          color={color}
          size={size}
        />
      </Provider>
    );
  }
});
