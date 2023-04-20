import React from 'react';
import {Linking} from 'react-native';

import {Provider} from 'react-redux';
import {render, fireEvent} from '@testing-library/react-native';
import {Store} from 'redux';

import mocks from 'test/mocks';

import UserCard from './user-card';

import {User} from 'types/User';
import {__setStorageState} from 'components/storage/storage';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import Router from 'components/router/router';

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
      const {queryByTestId} = doRender({user: userMock});

      expect(queryByTestId('test:id/userCard')).toBeNull();
    });
  });


  describe('User basic read permission', () => {
    beforeEach(() => {
      jest.spyOn(issuePermissionsMock, 'canReadUserBasic').mockReturnValueOnce(true);
    });

    it('should render user card', () => {
      const {getByTestId} = doRender({user: userMock});

      expect(getByTestId('test:id/userCard')).toBeTruthy();
    });

    it('should render user`s login', () => {
      const {getByTestId} = doRender({user: userMock});

      expect(getByTestId('test:id/userCardName')).toBeTruthy();
    });

    it('should render user`s related group icon', () => {
      const {getByTestId} = doRender({
        user: {
          ...userMock,
          issueRelatedGroup: {
            icon: 'https://',
          },
        },
      });

      expect(getByTestId('test:id/userCardRelatedGroup')).toBeTruthy();
    });

    it('should not render user`s email', () => {
      const {queryByTestId} = doRender({user: userMock});

      expect(queryByTestId('test:id/userCardEmail')).toBeNull();
    });

    it('should navigate to the user profile', () => {
      const {getByTestId} = doRender({user: userMock});
      const userName = getByTestId('test:id/userCardName');

      expect(userName).toBeTruthy();
      fireEvent.press(userName);
      expect(Linking.openURL).toHaveBeenCalled();
    });


    it('should not render mention button', () => {
      const {queryByTestId} = doRender({user: userMock});

      expect(queryByTestId('test:id/userCardMentionButton')).toBeNull();
    });

    it('should not render reported issues button', () => {
      const {queryByTestId} = doRender({user: {} as User});

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
      const {getByTestId, findAllByText} = doRender({user: {...userMock, email: emailMock}});

      expect(getByTestId('test:id/userCardEmail')).toBeTruthy();
      expect(findAllByText(emailMock)).toBeTruthy();
    });

    it('should invoke mention button callback', () => {
      const onMentionMock = jest.fn();
      const {getByTestId} = doRender({user: userMock, onMention: onMentionMock});

      fireEvent.press(getByTestId('test:id/userCardMentionButton'));

      expect(onMentionMock).toHaveBeenCalledWith(`@${userMock.login} `);
    });

    it('should invoke reported issues button', () => {
      const {getByTestId} = doRender({user: userMock});

      fireEvent.press(getByTestId('test:id/userCardReportedIssuesButton'));

      expect(Router.Issues).toHaveBeenCalledWith({searchQuery: `created by: ${userMock.login}`});
    });
  });
});

function doRender({user, onMention}: { user: User, onMention?: (userLogin: string) => void }) {
  return render(
    <Provider store={storeMock}>
      <UserCard
        user={user}
        onMention={onMention}
      />
    </Provider>
  );
}
