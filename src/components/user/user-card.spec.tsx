import React from 'react';
import {Linking} from 'react-native';

import {Provider} from 'react-redux';
import {act, render, fireEvent, screen} from '@testing-library/react-native';
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
import {__setStorageState, StorageState} from 'components/storage/storage';

import type {AnyIssue} from 'types/Issue';
import type {User, UserCurrent, YtCurrentUser, YtCurrentUserWithRelatedGroup} from 'types/User';

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn().mockResolvedValue(null),
}));

let apiMock;
let issuePermissionsMock: IssuePermissions;
let storeMock: Store;
let userMock: UserCurrent;
const noop = jest.fn(() => false);

describe('<UserCard/>', () => {
  beforeEach(() => {
    userMock = {
      id: 'id',
      name: 'userName',
      guest: false,
      banned: false,
      endUserAgreementConsent: {
        accepted: true,
      },
      profile: {
        avatar: {
          url: 'http://',
        },
      },
      ytCurrentUser: mocks.createUserMock(),
    };

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
    } as unknown as StorageState);

    const authMock = mocks.createAuthMock(mocks.createConfigMock()) as OAuth2;
    apiMock = new Api(authMock);
    setApi({
      ...apiMock,
      user: {
        getUserCard: jest.fn().mockResolvedValue(userMock.ytCurrentUser),
      },
    } as unknown as Api);
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
        ...userMock.ytCurrentUser,
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
      act(() => {
        fireEvent.press(userName);
      });
      expect(Linking.openURL).toHaveBeenCalled();
    });


    it('should not render mention button', () => {
      jest.spyOn(useUserCard, 'useUserCardAsync').mockResolvedValue(undefined as never);
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
      doRender({...userMock.ytCurrentUser, email: emailMock});

      expect(screen.getByTestId('test:id/userCardEmail')).toBeTruthy();
      expect(screen.findAllByText(emailMock)).toBeTruthy();
    });

    it('should invoke mention button callback', () => {
      jest.spyOn(useUserCard, 'useUserCardAsync').mockResolvedValue({} as never);
      jest.spyOn(issuePermissionsMock, 'canCommentOn').mockReturnValueOnce(true);
      jest.spyOn(appActions, 'addMentionToDraftComment');

      doRender();

      act(() => {
        fireEvent.press(screen.getByTestId('test:id/userCardMentionButton'));
      });

      expect(appActions.addMentionToDraftComment).toHaveBeenCalledWith(userMock.ytCurrentUser.login);
    });

    it('should invoke reported issues button', () => {
      doRender();

      act(() => {
        fireEvent.press(screen.getByTestId('test:id/userCardReportedIssuesButton'));
      });

      expect(Router.Issues).toHaveBeenCalledWith({searchQuery: `created by: ${userMock.ytCurrentUser.login}`});
    });
  });

  function doRender(user: YtCurrentUser | YtCurrentUserWithRelatedGroup = userMock.ytCurrentUser) {
    render(
      <Provider store={storeMock}>
        <UserCard user={user}/>
      </Provider>
    );
  }
});

