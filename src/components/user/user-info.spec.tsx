import React from 'react';
import {View} from 'react-native';

import {render} from '@testing-library/react-native';

import UserInfo from './user-info';

import type {User} from 'types/User';
import mocks from 'test/mocks';

const avatarURLMock = 'http://example.com/avatarUrl';

describe('<UserInfo/>', () => {
  let userMock: User;
  beforeEach(() => {
    userMock = mocks.createUserMock();
  });

  describe('Render', () => {
    it('should render component', () => {
      const {getByTestId} = render(<UserInfo user={userMock} timestamp={Date.now()} />);
      expect(getByTestId('UserInfo')).toBeTruthy();
    });

    describe('User name', () => {
      it('should render user`s name', () => {
        const {getByTestId} = render(<UserInfo user={userMock} timestamp={Date.now()} />);
        expect(getByTestId('UserInfoName')).toBeTruthy();
      });

      it('should not render user`s name', () => {
        const {queryByTestId} = render(<UserInfo user={{} as User} timestamp={Date.now()} />);
        expect(queryByTestId('UserInfoName')).toBeNull();
      });
    });

    describe('Timestamp', () => {
      it('should render timestamp', () => {
        const {getByTestId} = render(<UserInfo user={userMock} timestamp={Date.now()} />);
        expect(getByTestId('UserInfoTimestamp')).toBeTruthy();
      });
    });

    describe('Additional info', () => {
      it('should render additional info after the user name', () => {
        const additionalInfoMock = 'additional text';
        const {getByTestId} = render(
          <UserInfo user={userMock} timestamp={Date.now()} additionalInfo={additionalInfoMock} />
        );
        expect(getByTestId('UserAdditionalInfo')).toBeTruthy();
      });
    });

    describe('Avatar', () => {
      it('should not render user`s avatar', () => {
        const {queryByTestId} = render(<UserInfo user={{...userMock, avatarUrl: ''}} timestamp={Date.now()} />);
        expect(queryByTestId('UserInfoAvatar')).toBeNull();
      });

      it('should render user`s avatar', () => {
        const {getByTestId} = render(
          <UserInfo user={{...userMock, avatarUrl: avatarURLMock}} timestamp={Date.now()} />
        );
        expect(getByTestId('UserInfoAvatar')).toBeTruthy();
      });

      it('should render custom avatar', () => {
        const testId = 'customAvatar';
        const {getByTestId} = render(
          <UserInfo user={userMock} avatar={<View testID={testId} />} timestamp={Date.now()} />
        );

        expect(getByTestId(testId)).toBeTruthy();
      });
    });
  });
});
