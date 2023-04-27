import React from 'react';
import {Linking} from 'react-native';

import {Provider} from 'react-redux';
import {render, fireEvent} from '@testing-library/react-native';
import {Store} from 'redux';

import mocks from 'test/mocks';

import * as appActions from 'actions/app-actions';
import * as useUserCard from 'components/hooks/use-user-card-async';
import UserCard from './user-card';

import {User} from 'types/User';
import {__setStorageState} from 'components/storage/storage';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import Router from 'components/router/router';
import {AnyIssue} from 'types/Issue';

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn().mockResolvedValue(null),
}));

let issuePermissionsMock: IssuePermissions;
let storeMock: Store;
let userMock: User;
const noop = jest.fn(() => false);

describe('<UserCard/>', () => {
  beforeEach(() => {
    userMock = mocks.createUserMock();

    issuePermissionsMock = new IssuePermissions({
      has: noop,
      hasEvery: noop,
      hasSome: noop,
      permissionsMap: {},
    }, userMock);

    storeMock = mocks.createMockStore([])({
      app: {
        networkState: {
          isConnected: true,
        },
        issuePermissions: issuePermissionsMock,
        draftCommentData: {
          entity: {} as AnyIssue,
          setDraft: jest.fn(),
        },
      },
    });

    __setStorageState({
      config: {
        backendUrl: 'https://example.com',
      },
    });
  });

  describe('No read user permission', () => {
    it('should not render user card', () => {
      const {queryByTestId} = doRender();

      expect(queryByTestId('test:id/userCard')).toBeNull();
    });
  });


  describe('User basic read permission', () => {
    beforeEach(() => {
      jest.spyOn(issuePermissionsMock, 'canReadUserBasic').mockReturnValueOnce(true);
    });

    it('should render user card', () => {
      const {getByTestId} = doRender();

      expect(getByTestId('test:id/userCard')).toBeTruthy();
    });

    it('should render user`s login', () => {
      const {getByTestId} = doRender();

      expect(getByTestId('test:id/userCardName')).toBeTruthy();
    });

    it('should render user`s related group icon', () => {
      const {getByTestId} = doRender({
        ...userMock,
        issueRelatedGroup: {
          icon: 'https://',
        },
      });

      expect(getByTestId('test:id/userCardRelatedGroup')).toBeTruthy();
    });

    it('should not render user`s email', () => {
      const {queryByTestId} = doRender();

      expect(queryByTestId('test:id/userCardEmail')).toBeNull();
    });

    it('should navigate to the user profile', () => {
      const {getByTestId} = doRender();
      const userName = getByTestId('test:id/userCardName');

      expect(userName).toBeTruthy();
      fireEvent.press(userName);
      expect(Linking.openURL).toHaveBeenCalled();
    });


    it('should not render mention button', () => {
      jest.spyOn(useUserCard, 'useUserCardAsync').mockResolvedValue(null);
      const {queryByTestId} = doRender();

      expect(queryByTestId('test:id/userCardMentionButton')).toBeNull();
    });

    it('should not render reported issues button', () => {
      const {queryByTestId} = doRender({} as User);

      expect(queryByTestId('test:id/userCardReportedIssuesButton')).toBeNull();
    });
  });


  describe('User full read permission', () => {
    beforeEach(() => {
      jest.spyOn(issuePermissionsMock, 'canReadUser').mockReturnValueOnce(true);
      Router.Issues = jest.fn();
    });


    it('should render user`s email', () => {
      const emailMock = 'me@me.me';
      const {getByTestId, findAllByText} = doRender({...userMock, email: emailMock});

      expect(getByTestId('test:id/userCardEmail')).toBeTruthy();
      expect(findAllByText(emailMock)).toBeTruthy();
    });

    it('should invoke mention button callback', () => {
      jest.spyOn(useUserCard, 'useUserCardAsync').mockResolvedValue({});
      jest.spyOn(issuePermissionsMock, 'canCommentOn').mockReturnValueOnce(true);
      jest.spyOn(appActions, 'addMentionToDraftComment');
      const {getByTestId} = doRender();

      fireEvent.press(getByTestId('test:id/userCardMentionButton'));

      expect(appActions.addMentionToDraftComment).toHaveBeenCalledWith(userMock.login);
    });

    it('should invoke reported issues button', () => {
      const {getByTestId} = doRender();

      fireEvent.press(getByTestId('test:id/userCardReportedIssuesButton'));

      expect(Router.Issues).toHaveBeenCalledWith({searchQuery: `created by: ${userMock.login}`});
    });
  });

  function doRender(user: User = userMock) {
    return render(
      <Provider store={storeMock}>
        <UserCard user={user}/>
      </Provider>
    );
  }
});

