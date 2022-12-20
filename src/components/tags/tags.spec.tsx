import React from 'react';
import {shallow} from 'enzyme';
import Tags from './tags';
import styles from './tags.styles';
describe('<Tags/>', () => {
  let wrapper;
  let instance;
  let tagQueryMock;
  let onPressMock;
  let tagMock;
  beforeEach(() => {
    tagQueryMock = 'tag: foo';
    onPressMock = jest.fn();
    tagMock = {
      color: {
        id: 1,
      },
      query: tagQueryMock,
    };
    wrapper = doShallow([tagMock], onPressMock);
    instance = wrapper.instance();
  });
  describe('Render', () => {
    it('should render component', () => {
      expect(findByTestId('test:id/tagsList')).toHaveLength(1);
    });
  });
  describe('showContextActions', () => {
    it('should invoke prop`s `onTagPress` fn', async () => {
      instance.getSelectedActions = jest.fn(
        () => instance.getContextActions(tagMock)[0],
      );
      instance.forceUpdate();
      await instance.showContextActions(tagMock);
      expect(instance.props.onTagPress).toHaveBeenCalledWith(tagMock.query);
    });
  });
  describe('isDefaultColorCoding', () => {
    it('should return TRUE', () => {
      expect(
        instance.isDefaultColorCoding({
          color: {
            id: '0',
          },
        }),
      ).toEqual(styles.tagNoColor);
    });
    it('should not throw', () => {
      expect(() => instance.isDefaultColorCoding()).not.toThrow();
    });
    it('should return NULL if tag`s colo is not provided', () => {
      expect(instance.isDefaultColorCoding({})).toEqual(null);
    });
    it('should return NULL', () => {
      expect(instance.isDefaultColorCoding(tagMock)).toEqual(null);
    });
  });

  function findByTestId(testId) {
    return (
      wrapper &&
      wrapper.find({
        testID: testId,
      })
    );
  }

  function doShallow(tags = [], onTagPress = () => {}, inline = false) {
    return shallow(
      <Tags tags={tags} onTagPress={onTagPress} inline={inline} />,
    );
  }
});
