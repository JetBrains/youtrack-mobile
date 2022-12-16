import React from 'react';
import {View} from 'react-native';

import {shallow} from 'enzyme';

import UserInfo from './user-info';

import {buildStyles, DEFAULT_THEME} from '../theme/theme';

describe('<UserInfo/>', () => {

  let wrapper;
  let userMock;
  const avatarURLMock = 'http://example.com/avatarUrl';
  const userFullNameMock = 'userFullName';

  beforeAll(() => buildStyles(DEFAULT_THEME.mode, DEFAULT_THEME));

  beforeEach(() => {
    userMock = {
      id: 'userEntityId',
      fullName: userFullNameMock,
    };

    render(userMock);
  });


  describe('Render', () => {
    it('should render component', () => {
      expect(findByTestId('UserInfo')).toHaveLength(1);
    });

    describe('User name', () => {
      it('should render user`s name', () => {
        expect(findByTestId('UserInfoName')).toHaveLength(1);
      });

      it('should not render user`s name', () => {
        render({});
        expect(findByTestId('UserInfoName')).toHaveLength(0);
      });
    });

    describe('Timestamp', () => {
      it('should render timestamp', () => {
        render(userMock, Date.now());
        expect(findByTestId('UserInfoTimestamp')).toHaveLength(1);
      });
    });

    describe('Additional info', () => {
      it('should render additional info after the user name', () => {
        const additionalInfoMock = 'additional text';
        render(userMock, undefined, additionalInfoMock);
        expect(findByTestId('UserAdditionalInfo')).toHaveLength(1);
      });
    });

    describe('Avatar', () => {
      it('should not render user`s avatar', () => {
        render(userMock);
        expect(findByTestId('UserInfoAvatar')).toHaveLength(0);
      });

      it('should render user`s avatar', () => {
        render({...userMock, ...{avatarUrl: avatarURLMock}});
        expect(findByTestId('UserInfoAvatar')).toHaveLength(1);
      });

      it('should render custom avatar', () => {
        const testId = 'customAvatar';
        render({...userMock, ...{avatar: <View testID={testId}/>}});

        expect(wrapper.shallow().find({testID: 'UserInfoAvatar'})).toHaveLength(0);
        expect(findByTestId(testId)).toHaveLength(0);
      });
    });
  });


  function render(user, timestamp, additionalInfo) {
    wrapper = doShallow(user, timestamp, additionalInfo);
  }

  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(user = {}, timestamp = Date.now(), additionalInfo = null) {
    return shallow(
      <UserInfo
        user={user}
        timestamp={timestamp}
        additionalInfo={additionalInfo}
      />
    );
  }
});
