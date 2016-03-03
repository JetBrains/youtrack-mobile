import {shallow} from 'enzyme';
import React from 'react';
import TextWithImages from './text-with-images';
import {View} from 'react-native';

describe('<TextWithImages/>', () => {
  it('should replace image syntax with <Image/>', () => {
    const template = TextWithImages.renderView('foo !img.png! bar', [{id: 'test', url: 'foo.ru', value: 'img.png'}]);
    const image = shallow(<View>{template}</View>).find('Image');

    image.props().source.uri.should.equal('foo.ru');
  });
});
