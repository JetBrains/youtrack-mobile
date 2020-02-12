import React from 'react';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import UserInfo from './user-info';

import {User} from '../../flow/User';

describe('<UserInfo/>', () => {

  let wrapper;
  let userMock;
  const avatarURLMock = 'http://example.com/avatarUrl';
  const userFullNameMock = 'userFullName';

  beforeEach(() => {
    userMock = {
      id: 'userEntityId',
      fullName: userFullNameMock
    };

    render(userMock);
  });


  describe('Render', () => {
    it('should match a snapshot', () => {
      expect(toJson(wrapper)).toMatchSnapshot();
    });

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

    describe('Avatar', () => {
      it('should not render user`s avatar', () => {
        render(userMock);
        expect(findByTestId('UserInfoAvatar')).toHaveLength(0);
      });

      it('should render user`s avatar', () => {
        render({...userMock, ...{avatarUrl: avatarURLMock}});
        expect(findByTestId('UserInfoAvatar')).toHaveLength(1);
      });
    });
  });


  function render(user: User, timestamp: ?Number) {
    wrapper = doShallow(user, timestamp);
  }

  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(user: User = {}, timestamp: Number = Date.now()) {
    return shallow(
      <UserInfo
        user={user}
        timestamp={timestamp}
      />
    );
  }
});
