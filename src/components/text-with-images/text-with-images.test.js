import {shallow} from 'enzyme';
import React from 'react';
import TextWithImages from './text-with-images';
import {View} from 'react-native';

describe('<TextWithImages/>', () => {
  it('should replace image syntax with <Image/>', () => {
    const template = TextWithImages.renderView('foo !img.png! bar', [{id: 'test', url: 'foo.ru', name: 'img.png'}]);
    const image = shallow(<View>{template}</View>).find('Image');

    image.props().source.uri.should.equal('foo.ru');
  });

  it('should replace split text to text and image nodes', () => {
    const template = TextWithImages.renderView('foo !img.png! bar', [{id: 'test', url: 'foo.ru', name: 'img.png'}]);
    const container = shallow(<View>{template}</View>);

    container.children().length.should.equal(3);
    container.find('Text').length.should.equal(2);
  });
});
