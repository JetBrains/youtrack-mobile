import React from 'react';
import {shallow} from 'enzyme';

import ColorField from '../color-field/color-field';

describe('<ColorField/>', () => {
  let fakeField;

  beforeEach(() => {
    fakeField = {
      name: 'Test custom field',
      color: {id: 4, background: '#000', foreground: '#FFF'}
    };
  });

  it('should init', () => {
    const wrapper = shallow(<ColorField text={fakeField.name} color={fakeField.color}/>);

    wrapper.should.be.defined;
  });

  it('should render first letter of color field', () => {
    const wrapper = shallow(<ColorField text={fakeField.name} color={fakeField.color}/>);

    wrapper.find({testID: 'color-field-value'}).children().should.have.text('T');
  });

  it('should render whole text of color field', () => {
    const wrapper = shallow(<ColorField text={fakeField.name} fullText={true} color={fakeField.color}/>);

    wrapper.find({testID: 'color-field-value'}).children().should.have.text(fakeField.name);
  });

  it('should set background color', () => {
    const container = shallow(<ColorField text={fakeField.name} color={fakeField.color}/>).find({testID: 'color-field-value-wrapper'});
    const backgroundColor = container.props().style[1].backgroundColor;

    backgroundColor.should.equal('#000');
  });

  it('should set foreground color', () => {
    const container = shallow(<ColorField text={fakeField.name} color={fakeField.color}/>).find({testID: 'color-field-value'});
    const foregroundColor = container.props().style[1].color;

    foregroundColor.should.equal('#FFF');
  });

});
