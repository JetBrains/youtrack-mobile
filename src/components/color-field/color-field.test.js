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
    let wrapper = shallow(<ColorField text={fakeField.name} color={fakeField.color}/>);

    wrapper.should.be.defined;
  });

  it('should render first letter of color field', () => {
    let wrapper = shallow(<ColorField text={fakeField.name} color={fakeField.color}/>);

    wrapper.find('Text').children().should.have.text('T');
  });

  it('should render whole text of color field', () => {
    let wrapper = shallow(<ColorField text={fakeField.name} fullText={true} color={fakeField.color}/>);

    wrapper.find('Text').children().should.have.text(fakeField.name);
  });

  it('should set background color', () => {
    const container = shallow(<ColorField text={fakeField.name} color={fakeField.color}/>).find('View');
    const backgroundColor = container.props().style[1].backgroundColor;

    backgroundColor.should.equal('#0066cc');
  });

  it('should set foreground color', () => {
    const container = shallow(<ColorField text={fakeField.name} color={fakeField.color}/>).find('Text');
    const backgroundColor = container.props().style[1].color;

    backgroundColor.should.equal('#FFF');
  });

});
