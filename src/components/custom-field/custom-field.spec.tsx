import React from 'react';
import {shallow} from 'enzyme';
import CustomField from './custom-field';
import {absDate} from 'components/date/date';
import {__setStorageState} from 'components/storage/storage';
describe('<CustomField/>', () => {
  let fakeField;
  beforeEach(() => {
    fakeField = {
      projectCustomField: {
        emptyFieldText: 'im empty',
        field: {
          name: 'Test custom field',
          fieldType: {
            valueType: 'some-type',
          },
        },
      },
      value: {
        name: 'Test value',
      },
      color: {
        id: 4,
      },
    };
  });
  it('should init', () => {
    const wrapper = shallow(<CustomField field={fakeField} />);
    wrapper.should.be.defined;
  });
  it('should render field name', () => {
    const wrapper = shallow(<CustomField field={fakeField} />);
    const name = wrapper.find({
      testID: 'test:id/name',
    });
    name.children().should.have.text(fakeField.projectCustomField.field.name);
  });
  it('should render localized field name', () => {
    fakeField.projectCustomField.field.localizedName = 'Test custom field name';
    const wrapper = shallow(<CustomField field={fakeField} />);
    const name = wrapper.find({
      testID: 'test:id/name',
    });
    name
      .children()
      .should.have.text(fakeField.projectCustomField.field.localizedName);
  });
  it('should render shortened field name', () => {
    fakeField.projectCustomField.field.localizedName =
      'Test custom field long-long-long name';
    const wrapper = shallow(<CustomField field={fakeField} />);
    const name = wrapper.find({
      testID: 'test:id/name',
    });
    name.children().should.have.text('Test custom field long-long-lo…');
  });
  it('should render field value', () => {
    const wrapper = shallow(<CustomField field={fakeField} />);
    const value = wrapper.find({
      testID: 'test:id/value',
    });
    value.children().should.have.text(fakeField.value.localizedName);
  });
  it('should render localized field value', () => {
    fakeField.value = {
      name: 'Test value',
      localizedName: 'Test value localized',
    };
    const wrapper = shallow(<CustomField field={fakeField} />);
    const value = wrapper.find({
      testID: 'test:id/value',
    });
    value.children().should.have.text(fakeField.value.localizedName);
  });
  it('should render user field value with avatar', () => {
    __setStorageState({});

    const userFieldMock = {
      projectCustomField: {
        field: {
          fieldType: {
            valueType: 'user',
          },
        },
      },
      value: {
        fullName: 'Full Name',
        avatarUrl: '/userAvatarUrl',
      },
    };
    const wrapper = shallow(<CustomField field={userFieldMock} />);
    expect(
      wrapper.find({
        testID: 'test:id/customFieldAvatar',
      }),
    ).toHaveLength(1);
    expect(
      wrapper
        .find({
          testID: 'test:id/value',
        })
        .children(),
    ).toHaveLength(1);
  });
  it('should render value of type date', () => {
    const timestamp = 1481885918348;
    fakeField.value = timestamp;
    fakeField.projectCustomField.field.fieldType.valueType = 'date';
    const wrapper = shallow(<CustomField field={fakeField} />);
    const value = wrapper.find({
      testID: 'test:id/value',
    });
    value.children().should.have.text(absDate(timestamp, true));
  });
  it('should render value of type integer', () => {
    fakeField.value = 123;
    fakeField.projectCustomField.field.fieldType.valueType = 'integer';
    const wrapper = shallow(<CustomField field={fakeField} />);
    const value = wrapper.find({
      testID: 'test:id/value',
    });
    value.children().should.have.text('123');
  });
  it('should render user field value', () => {
    fakeField.value.name = null;
    fakeField.value.login = 'testuser';
    const wrapper = shallow(<CustomField field={fakeField} />);
    const value = wrapper.find({
      testID: 'test:id/value',
    });
    value.children().should.have.text('testuser');
  });
  it('should render empty value if value is empty', () => {
    fakeField.value = null;
    const wrapper = shallow(<CustomField field={fakeField} />);
    const value = wrapper.find({
      testID: 'test:id/value',
    });
    value
      .children()
      .should.have.text(fakeField.projectCustomField.emptyFieldText);
  });
  it('should render empty value if value is empty array', () => {
    fakeField.value = [];
    const wrapper = shallow(<CustomField field={fakeField} />);
    const value = wrapper.find({
      testID: 'test:id/value',
    });
    value
      .children()
      .should.have.text(fakeField.projectCustomField.emptyFieldText);
  });
});
