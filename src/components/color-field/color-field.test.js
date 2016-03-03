import React from 'react';
import {shallow} from 'enzyme';

import ColorField from '../color-field/color-field';

describe('<ColorField/>', () => {
  let fakeField;

  beforeEach(() => {
    fakeField = [
      'Test custom field'
    ];
    fakeField.color = {
      fg: 'red',
      bg: 'white'
    }
  });

  it('should init', () => {
    let wrapper = shallow(<ColorField field={fakeField}/>);

    expect(wrapper).to.be.defined;
  });

  it('should render first letter of color field', () => {
    let wrapper = shallow(<ColorField field={fakeField}/>);
    let LetterItems = wrapper.findWhere((component) => component.props().children === 'T');

    expect(LetterItems.length).to.equal(1);
  });

});
