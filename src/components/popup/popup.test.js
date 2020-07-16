import React from 'react';
import {Text} from 'react-native';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import Popup from './popup';


describe('<Popup/>', () => {

  let wrapper;
  let instance;
  let childrenRendererMock;

  beforeEach(() => {
    childrenRendererMock = () => <Text testID="popupChildren"/>;
    render(childrenRendererMock);
  });


  describe('Render', () => {
    it('should match a snapshot', () => {
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render children', () => {
      expect(findByTestId('popupChildren')).toHaveLength(1);
    });

  });


  function render(error: string, tips?: string, showSupportLink: boolean = false) {
    wrapper = doShallow(error, tips, showSupportLink);
    instance = wrapper.instance();
    return instance;
  }

  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(childrenRenderer) {
    return shallow(
      <Popup
        childrenRenderer={childrenRenderer}
      />
    );
  }
});
