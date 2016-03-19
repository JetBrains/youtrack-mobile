import React from 'react';
import {shallow} from 'enzyme';

import CustomField from './custom-field';

describe('<CustomField/>', () => {
  let fakeField;

  beforeEach(() => {
    fakeField = {
      projectCustomField: {
        emptyFieldText: 'im empty',
        field: {
          name: 'Test custom field'
        }
      },
      value: {
        name: 'Test value'
      },
      color: {id: 4}
    };
  });

  it('should init', () => {
    let wrapper = shallow(<CustomField field={fakeField}/>);

    wrapper.should.be.defined;
  });

  it('should render field name', () => {
    let wrapper = shallow(<CustomField field={fakeField}/>);
    const name = wrapper.findWhere(component => component.props().testID === 'name');
    name.children().should.have.text(fakeField.projectCustomField.field.name);
  });

  it('should render field value', () => {
    let wrapper = shallow(<CustomField field={fakeField}/>);
    const value = wrapper.findWhere(component => component.props().testID === 'value');
    value.children().should.have.text(fakeField.value.name);
  });

  it('should render user field value', () => {
    fakeField.value.name = null;
    fakeField.value.login = 'testuser';
    let wrapper = shallow(<CustomField field={fakeField}/>);
    const value = wrapper.findWhere(component => component.props().testID === 'value');
    value.children().should.have.text('testuser');
  });

  it('should render empty value if value is empty', () => {
    fakeField.value = null;
    let wrapper = shallow(<CustomField field={fakeField}/>);
    const value = wrapper.findWhere(component => component.props().testID === 'value');
    value.children().should.have.text(fakeField.projectCustomField.emptyFieldText);
  });

  it('should render empty value if value is empty array', () => {
    fakeField.value = [];
    let wrapper = shallow(<CustomField field={fakeField}/>);
    const value = wrapper.findWhere(component => component.props().testID === 'value');
    value.children().should.have.text(fakeField.projectCustomField.emptyFieldText);
  });

  it('should render array values joined', () => {
    fakeField.value = [{name: 'first'}, {name: 'second'}];
    let wrapper = shallow(<CustomField field={fakeField}/>);
    const value = wrapper.findWhere(component => component.props().testID === 'value');
    value.children().should.have.text('first, second');
  });
});
