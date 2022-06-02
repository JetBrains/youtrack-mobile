import React from 'react';

import {render} from '@testing-library/react-native';

import mocks from '../../../test/mocks';
import Thread from './inbox-threads__thread';
import {DEFAULT_THEME} from 'components/theme/theme';


describe('Inbox Thread', () => {

  describe('Render', () => {

    it('should render Thread entity', () => {
      const {getByTestId} = doRender(mocks.createThreadMock());

      expect(getByTestId('test:id/inboxEntity')).toBeTruthy();
    });

    it('should render Thread`s readable id', () => {
      const {getByTestId} = doRender(mocks.createThreadMock());

      expect(getByTestId('test:id/inboxEntityReadableId')).toBeTruthy();
    });

    it('should render Thread`s summary', () => {
      const {getByTestId} = doRender(mocks.createThreadMock({subject: {target: {summary: 'text'}}}));

      expect(getByTestId('test:id/inboxEntitySummary')).toBeTruthy();
    });

  });


  function doRender(thread) {
    return render(
      <Thread
        thread={thread}
        currentUser={mocks.createUserMock()}
        uiTheme={DEFAULT_THEME}
      />
    );
  }

});
