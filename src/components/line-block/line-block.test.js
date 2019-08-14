import React from 'react';
import {Text} from 'react-native';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import LineBlock from './line-block';

describe('<LineBlock/>', () => {

  let wrapper;
  let children;
  let lineBlockChildrenMock;

  beforeEach(() => {
    lineBlockChildrenMock = 'lineBlockChildrenMock';
    children = <Text testID={lineBlockChildrenMock}>'content'</Text>;
    wrapper = doShallow(children);
  });


  describe('Render', () => {
    it('should match a snapshot', () => {
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render component', () => {
      expect(findByTestId('lineBlock')).toHaveLength(1);
    });

    it('should children', () => {
      expect(findByTestId(lineBlockChildrenMock)).toHaveLength(1);
    });

    it('should show all button', () => {
      expect(findByTestId('lineBlockMore')).toHaveLength(1);
    });


    describe('Modal', () => {

      it('should show all children', () => {
        findByTestId('lineBlockMore').simulate('press');

        expect(findByTestId(lineBlockChildrenMock)).toHaveLength(3);
      });

      it('should close modal', () => {
        findByTestId('lineBlockMore').simulate('press');
        expect(findByTestId('lineBlockModalClose')).toHaveLength(1);

        findByTestId('lineBlockModalClose').simulate('press');
        expect(findByTestId('lineBlockModal')).toHaveLength(0);
        expect(findByTestId(lineBlockChildrenMock)).toHaveLength(1);
      });
    });
  });


  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(children: React$Element<Text>, inline: boolean) {
    return shallow(
      <LineBlock
        inline={inline}
        childrenRenderer={() => children}
        allChildrenRenderer={() => <Text>{children}{children}</Text>}
      />
    );
  }
});
