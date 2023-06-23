import React from 'react';
import {Linking} from 'react-native';

import {Provider} from 'react-redux';
import {render, fireEvent, screen} from '@testing-library/react-native';
import {Store} from 'redux';

import mocks from 'test/mocks';

import * as appActions from 'actions/app-actions';
import * as useUserCard from 'components/hooks/use-user-card-async';
import UserCard from './user-card';
import {setApi} from 'components/api/api__instance';

import Api from 'components/api/api';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import OAuth2 from 'components/auth/oauth2';
import Router from 'components/router/router';
import {__setStorageState} from 'components/storage/storage';
import {AnyIssue} from 'types/Issue';
import {User} from 'types/User';

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn().mockResolvedValue(null),
}));

let apiMock;
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

    const authMock = mocks.createAuthMock(mocks.createConfigMock()) as OAuth2;
    apiMock = new Api(authMock);
    setApi({
      ...apiMock,
      user: {
        getUserCard: jest.fn(),
      },
    });
  });

  describe('No read user permission', () => {
    it('should not render user card', () => {
      doRender();

      expect(screen.queryByTestId('test:id/userCard')).toBeNull();
    });
  });


  describe('User basic read permission', () => {
    beforeEach(() => {
      jest.spyOn(issuePermissionsMock, 'canReadUserBasic').mockReturnValueOnce(true);
    });

    it('should render user card', () => {
      doRender();

      expect(screen.getByTestId('test:id/userCard')).toBeTruthy();
    });

    it('should render user`s login', () => {
      doRender();

      expect(screen.getByTestId('test:id/userCardName')).toBeTruthy();
    });

    it('should render user`s related group icon', () => {
      doRender({
        ...userMock,
        issueRelatedGroup: {
          icon: 'https://',
        },
      });

      expect(screen.getByTestId('test:id/userCardRelatedGroup')).toBeTruthy();
    });

    it('should not render user`s email', () => {
      doRender();

      expect(screen.queryByTestId('test:id/userCardEmail')).toBeNull();
    });

    it('should navigate to the user profile', () => {
      doRender();
      const userName = screen.getByTestId('test:id/userCardName');

      expect(userName).toBeTruthy();
      fireEvent.press(userName);
      expect(Linking.openURL).toHaveBeenCalled();
    });


    it('should not render mention button', () => {
      jest.spyOn(useUserCard, 'useUserCardAsync').mockResolvedValue(null);
      doRender();

      expect(screen.queryByTestId('test:id/userCardMentionButton')).toBeNull();
    });

    it('should not render reported issues button', () => {
      doRender({} as User);

      expect(screen.queryByTestId('test:id/userCardReportedIssuesButton')).toBeNull();
    });
  });


  describe('User full read permission', () => {
    beforeEach(() => {
      jest.spyOn(issuePermissionsMock, 'canReadUser').mockReturnValueOnce(true);
      Router.Issues = jest.fn();
    });


    it('should render user`s email', () => {
      const emailMock = 'me@me.me';
      doRender({...userMock, email: emailMock});

      expect(screen.getByTestId('test:id/userCardEmail')).toBeTruthy();
      expect(screen.findAllByText(emailMock)).toBeTruthy();
    });

    it('should invoke mention button callback', () => {
      jest.spyOn(useUserCard, 'useUserCardAsync').mockResolvedValue({});
      jest.spyOn(issuePermissionsMock, 'canCommentOn').mockReturnValueOnce(true);
      jest.spyOn(appActions, 'addMentionToDraftComment');
      doRender();

      fireEvent.press(screen.getByTestId('test:id/userCardMentionButton'));

      expect(appActions.addMentionToDraftComment).toHaveBeenCalledWith(userMock.login);
    });

    it('should invoke reported issues button', () => {
      doRender();

      fireEvent.press(screen.getByTestId('test:id/userCardReportedIssuesButton'));

      expect(Router.Issues).toHaveBeenCalledWith({searchQuery: `created by: ${userMock.login}`});
    });
  });

  function doRender(user: User = userMock) {
    render(
      <Provider store={storeMock}>
        <UserCard user={user}/>
      </Provider>
    );
  }
});

