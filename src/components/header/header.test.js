import React from 'react';
import {Text} from 'react-native';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import Header from './header';

describe('<Header/>', () => {

  let wrapper;

  describe('Render', () => {
    beforeEach(() => {
      wrapper = doShallow();
    });

    it('should match a snapshot', () => {
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render component', () => {
      expect(findByTestId('header')).toHaveLength(1);
    });
  });


  describe('Render elements', () => {
    let titleMock;
    let childrenMock;

    beforeEach(() => {
      titleMock = 'Title';
      childrenMock = <Text>{titleMock}</Text>;

      wrapper = doShallow(titleMock, childrenMock);
    });

    it('should render component', () => {
      expect(findByTestId('header')).toHaveLength(1);
    });

    it('should render title', () => {
      expect(findByTestId('headerTitle')).toHaveLength(1);
    });

    it('should render children', () => {
      expect(wrapper.contains(childrenMock)).toEqual(true);
    });
  });


  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(title, children) {
    return shallow(
      <Header
        title={title}
      >
        {children}
      </Header>
    );
  }
});
