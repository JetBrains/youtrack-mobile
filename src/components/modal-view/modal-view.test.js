import React from 'react';
import {Text} from 'react-native';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import ModalView from './modal-view';

describe('<ModalView/>', () => {

  let wrapper;

  describe('Render', () => {
    beforeEach(() => {
      wrapper = doShallow();
    });

    it('should match a snapshot', () => {
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render component', () => {
      expect(findByTestId('modalView')).toHaveLength(1);
    });
  });


  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(
    {
      visible,
      transparent,
      animationType,
      supportedOrientations,
      onRequestClose
    } = {}
  ) {
    return shallow(
      <ModalView
        visible={visible}
        transparent={transparent}
        animationType={animationType}
        supportedOrientations={supportedOrientations}
        onRequestClose={onRequestClose}

      ><Text>children</Text>
      </ModalView>
    );
  }
});
