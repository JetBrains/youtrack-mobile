import React from 'react';
import {shallow} from 'enzyme';

import ColorField from '../color-field/color-field';

describe('<ColorField/>', () => {
  let fakeField;

  beforeEach(() => {
    fakeField = {
      name: 'Test custom field',
      color: {id: 4}
    };
  });

  it('should init', () => {
    let wrapper = shallow(<ColorField field={fakeField}/>);

    wrapper.should.be.defined;
  });

  it('should render first letter of color field', () => {
    let wrapper = shallow(<ColorField field={fakeField}/>);

    wrapper.find('Text').children().should.have.text('T');
  });

  it('should set background color', () => {
    const container = shallow(<ColorField field={fakeField}/>).find('View');
    const backgroundColor = container.props().style[1].backgroundColor;

    backgroundColor.should.equal('#FFF');
  });

  it('should set foreground color', () => {
    const container = shallow(<ColorField field={fakeField}/>).find('Text');
    const backgroundColor = container.props().style[1].color;

    backgroundColor.should.equal('#0066cc');
  });

});
