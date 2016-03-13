import React from 'react';
import {shallow} from 'enzyme';

import CustomField from './custom-field';

describe('<CustomField/>', () => {
  let fakeField;

  beforeEach(() => {
    fakeField = {
      name: 'fakeFieldName',
      value: 'fakeFieldValue',
      color: {
        fg: 'red',
        bg: 'white'
      }
    }
  });

  it('should init', () => {
    let wrapper = shallow(<CustomField field={fakeField}/>);

    wrapper.should.be.defined;
  });

  it('should render field name', () => {
    let wrapper = shallow(<CustomField field={fakeField}/>);
    const name = wrapper.findWhere(component => component.props().testID === 'name');
    name.children().should.have.text(fakeField.name);
  });

  it('should render field value', () => {
    let wrapper = shallow(<CustomField field={fakeField}/>);
    const value = wrapper.findWhere(component => component.props().testID === 'value');
    value.children().should.have.text(fakeField.value);
  });
});
