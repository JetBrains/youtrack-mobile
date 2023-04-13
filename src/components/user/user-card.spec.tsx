import React from 'react';
import {Linking} from 'react-native';

import {render, fireEvent} from '@testing-library/react-native';

import mocks from 'test/mocks';

import UserCard from './user-card';

import {User} from 'types/User';
import {__setStorageState} from 'components/storage/storage';

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn().mockResolvedValue(null),
}));

let userMock: User;

describe('<UserCard/>', () => {
  beforeEach(() => {
    userMock = mocks.createUserMock() as unknown as User;
    __setStorageState({
      config: {
        backendUrl: 'https://example.com',
      },
    });
  });

  it('should render component', () => {
    const {getByTestId} = doRender({user: userMock});

    expect(getByTestId('test:id/userCard')).toBeTruthy();
  });

  it('should navigate to the user profile', () => {
    const {getByTestId} = doRender({user: userMock});
    const userName = getByTestId('test:id/userCardName');

    expect(userName).toBeTruthy();
    fireEvent.press(userName);
    expect(Linking.openURL).toHaveBeenCalled();
  });

  it('should not render user`s email', () => {
    const {queryByTestId} = doRender({user: userMock});

    expect(queryByTestId('test:id/userCardEmail')).toBeNull();
  });

  it('should render user`s email', () => {
    const emailMock = 'me@me.me';
    const {getByTestId, findAllByText} = doRender({user: {...userMock, email: emailMock}});

    expect(getByTestId('test:id/userCardEmail')).toBeTruthy();
    expect(findAllByText(emailMock)).toBeTruthy();
  });

  it('should not render mention button', () => {
    const {queryByTestId} = doRender({user: userMock});

    expect(queryByTestId('test:id/userCardMentionButton')).toBeNull();
  });

  it('should invoke mention button callback', () => {
    const onMentionMock = jest.fn();
    const {getByTestId} = doRender({user: userMock, onMention: onMentionMock});

    fireEvent.press(getByTestId('test:id/userCardMentionButton'));

    expect(onMentionMock).toHaveBeenCalledWith(`@${userMock.login} `);
  });

  it('should not render reported issues button', () => {
    const {queryByTestId} = doRender({user: {} as User});

    expect(queryByTestId('test:id/userCardReportedIssuesButton')).toBeNull();
  });


  it('should invoke reported issues button callback', () => {
    const onShowReportedIssuesMock = jest.fn();
    const {getByTestId} = doRender({
      user: userMock,
      onShowReportedIssues: onShowReportedIssuesMock,
    });

    fireEvent.press(getByTestId('test:id/userCardReportedIssuesButton'));

    expect(onShowReportedIssuesMock).toHaveBeenCalledWith(`created by: ${userMock.login}`);
  });

  it('should not render related group icon', () => {
    const {queryByTestId} = doRender({user: userMock});

    expect(queryByTestId('test:id/userCardRelatedGroup')).toBeNull();
  });

  it('should render related group icon', () => {
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
});

function doRender({
  user,
  onShowReportedIssues = jest.fn(),
  onMention = null,
}: {
  user: User,
  onShowReportedIssues?: (query: string) => void,
  onMention?: ((userLogin: string) => void) | null
}) {
  return render(
    <UserCard
      user={user}
      onMention={onMention}
      onShowReportedIssues={onShowReportedIssues}
    />,
  );
}
