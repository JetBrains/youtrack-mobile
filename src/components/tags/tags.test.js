import React from 'react';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

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
      color: {id: 1},
      query: tagQueryMock
    };
    wrapper = doShallow([tagMock], onPressMock);
    instance = wrapper.instance();
  });


  describe('Render', () => {
    it('should match a snapshot', () => {
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render component', () => {
      expect(findByTestId('tagsListContainer')).toHaveLength(1);
    });
  });


  describe('_showActions', () => {
    it('should invoke prop`s `onTagPress` fn', async () => {
      instance._getSelectedActions = jest.fn(() => instance._getContextActions(tagMock)[0]);
      instance.forceUpdate();

      await instance._showActions(tagMock);

      expect(instance.props.onTagPress).toHaveBeenCalledWith(tagMock.query);
    });
  });


  describe('_toggleShowAll', () => {
    it('should toggle `showAllTags` state', () => {
      instance._toggleShowAll();
      expect(instance.state.showAllTags).toEqual(true);

      instance._toggleShowAll();
      expect(instance.state.showAllTags).toEqual(false);
    });
  });


  describe('_getTagSpecificStyle', () => {
    it('should return a specific tag style for a tag without a color coding', () => {
      expect(
        instance._getTagSpecificStyle({
          color: {id: '0'}
        })
      ).toEqual(styles.tagNoColor);
    });

    it('should return NULL for a tag with a color coding', () => {
      expect(
        instance._getTagSpecificStyle(tagMock)
      ).toEqual(null);
    });
  });


  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(tags = [], onTagPress = () => {}, inline = false) {
    return shallow(
      <Tags
        tags={tags}
        onTagPress={onTagPress}
        inline={inline}
      />
    );
  }
});
