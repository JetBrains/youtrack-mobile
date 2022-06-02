import React from 'react';
import {render} from '@testing-library/react-native';

import InboxThreadItemSubscription from './inbox-threads__subscription';
import mocks from '../../../test/mocks';
import {DEFAULT_THEME} from 'components/theme/theme';


describe('InboxThreadItemSubscription', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });


  describe('Render', () => {

    it('should render item', () => {
      const {getByTestId} = doRender(mocks.createThreadMock());

      expect(getByTestId('test:id/inboxThreadsSubscription')).toBeTruthy();
    });

    it('should render group', () => {
      const {getByTestId} = doRender(mocks.createThreadMock());

      expect(getByTestId('test:id/inboxThreadsSubscriptionGroup')).toBeTruthy();
    });


    describe('`show more` button', () => {
      let splittedActivitiesMock;
      let module;
      beforeEach(() => {
        module = require('components/activity/activity__split-activities');
        splittedActivitiesMock = [
          {head: {id: 'id1'}},
          {head: {id: 'id2'}},
          {head: {id: 'id3'}},
          {head: {id: 'id4'}},
        ];
        jest.spyOn(module, 'splitActivities');
      });

      it('should show button', () => {
        module.splitActivities.mockImplementationOnce(() => splittedActivitiesMock);

        const {getByTestId} = renderAnGetMatcher();

        expect(getByTestId('test:id/inboxThreadsSubscriptionShowMore')).toBeTruthy();
      });

      it('should not show button', () => {
        module.splitActivities.mockImplementationOnce(() => splittedActivitiesMock.slice(0, 2));

        const {queryByTestId} = renderAnGetMatcher();

        expect(queryByTestId('test:id/inboxThreadsSubscriptionShowMore')).toBeNull();
      });

      function renderAnGetMatcher() {
        return doRender(mocks.createThreadMock({messages: []}));
      }
    });

  });
});


function doRender(thread) {
  return render(
    <InboxThreadItemSubscription
      thread={thread}
      currentUser={mocks.createUserMock()}
      uiTheme={DEFAULT_THEME}
    />
  );
}
