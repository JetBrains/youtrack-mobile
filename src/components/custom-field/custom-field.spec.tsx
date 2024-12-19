import React from 'react';

import {render, screen} from '@testing-library/react-native';

import CustomField from './custom-field';
import {absDate} from 'components/date/date';

import type {CustomFieldBase, EnumBundleValue, UserFieldValue} from 'types/CustomFields';

let fieldMock: CustomFieldBase;
describe('<CustomField/>', () => {
  beforeEach(() => (fieldMock = createFielMock()));

  it('should render', () => {
    doRender();
    expect(screen.getByTestId('test:id/name')).toBeDefined();
  });

  it('should render field name', () => {
    doRender();

    const el = screen.getByTestId('test:id/name');
    expect(el.props.children).toContain(fieldMock.projectCustomField.field.name);
  });

  it('should render localized field name', () => {
    fieldMock.projectCustomField.field.localizedName = 'Test custom field name';

    doRender();

    const el = screen.getByTestId('test:id/name');
    expect(el.props.children).toContain(fieldMock.projectCustomField.field.localizedName);
  });

  it('should render shortened field name', () => {
    fieldMock.projectCustomField.field.localizedName = 'Test custom field long-long-long name';

    doRender();

    const nameElement = screen.getByTestId('test:id/name');
    expect(nameElement.props.children).toContain('Test custom field long-long-lo…');
  });

  it('should render field value', () => {
    doRender();

    const el = screen.getByTestId('test:id/value');
    expect(el.props.children).toContain((fieldMock.value as EnumBundleValue).name);
  });

  it('should render localized field value', () => {
    fieldMock.value = {
      ...(fieldMock.value as EnumBundleValue),
      localizedName: 'Test value localized',
    };

    doRender();

    const el = screen.getByTestId('test:id/value');
    expect(el.props.children).toContain((fieldMock.value as EnumBundleValue).localizedName);
  });

  it('should render user field value with avatar', () => {
    fieldMock = {
      ...fieldMock,
      projectCustomField: {
        ...fieldMock.projectCustomField,
        field: {
          ...fieldMock.projectCustomField.field,
          fieldType: {
            isMultiValue: false,
            valueType: 'user',
          },
        },
      },
      value: {
        ...fieldMock.value as UserFieldValue,
        fullName: 'Full Name',
        avatarUrl: '/userAvatarUrl.svg',
      } as UserFieldValue,
    };

    doRender();

    expect(screen.getByTestId('test:id/customFieldAvatar')).toBeTruthy();
    expect(screen.getByTestId('test:id/value')).toBeTruthy();
  });

  it('should render value of type date', () => {
    const timestamp = 1481885918348;
    fieldMock.value = timestamp;
    fieldMock.projectCustomField.field.fieldType.valueType = 'date';

    doRender();

    const el = screen.getByTestId('test:id/value');
    expect(el.props.children).toContain(absDate(timestamp, true));
  });

  it('should render value of type integer', () => {
    fieldMock.value = 123;
    fieldMock.projectCustomField.field.fieldType.valueType = 'integer';

    doRender();

    const el = screen.getByTestId('test:id/value');
    expect(el.props.children).toContain('123');
  });

  it('should render user field value', () => {
    fieldMock.value = {
      ...fieldMock.value as UserFieldValue,
      name: null,
      login: 'testuser',
    } as unknown as UserFieldValue;

    doRender();

    const el = screen.getByTestId('test:id/value');
    expect(el.props.children).toContain('testuser');
  });

  it('should render empty value if value is empty', () => {
    fieldMock.value = null;

    doRender();

    const el = screen.getByTestId('test:id/value');
    expect(el.props.children).toContain(fieldMock.projectCustomField.emptyFieldText);
  });

  it('should render empty value if value is empty array', () => {
    fieldMock.value = [];

    doRender();

    const el = screen.getByTestId('test:id/value');
    expect(el.props.children).toContain(fieldMock.projectCustomField.emptyFieldText);
  });

  function doRender(field: CustomFieldBase = fieldMock) {
    return render(<CustomField field={field} onPress={() => {}} disabled={false} active={false} />);
  }

  function createFielMock() {
    return {
      $type: '',
      id: '',
      name: 'Test custom field',
      projectCustomField: {
        $type: '',
        id: '',
        emptyFieldText: 'is empty',
        canBeEmpty: true,
        isPublic: true,
        bundle: {
          id: '',
          isUpdateable: true,
        },
        defaultValues: [],
        field: {
          $type: '',
          id: '',
          localizedName: null,
          name: 'Test custom field',
          fieldType: {
            isMultiValue: false,
            valueType: 'some-type',
          },
        },
      },
      value: {
        $type: '',
        id: 'Test value',
        name: 'Test value',
        localizedName: null,
      } as EnumBundleValue,
    };
  }
});
