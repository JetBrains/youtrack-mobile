import mocks from 'test/mocks';
import {getFieldType, updateCustomFieldValue} from './custom-field-helper';

import type {
  CustomFieldBase,
  CustomFieldText,
  ICustomField,
  ProjectCustomField,
  TextFieldValue,
} from 'types/CustomFields';

let customFieldMock: CustomFieldText;
let customFieldsMock: CustomFieldBase[];
let textMock: string;
describe('customFieldHelper', () => {
  describe('updateCustomFieldValue', () => {
    beforeEach(() => {
      textMock = 'Lorem ipsum';
      customFieldMock = mocks.createProjectCustomFieldMock({
        name: 'TextField',
        value: {
          text: textMock,
        },
        projectCustomField: {
          field: {
            fieldType: {
              valueType: 'text',
            },
          },
        },
      });
      customFieldsMock = [
        mocks.createProjectCustomFieldMock(),
        mocks.createProjectCustomFieldMock({value: 0}),
        customFieldMock,
        mocks.createProjectCustomFieldMock(),
      ];
    });

    it('should update custom field value in the array of custom fields', async () => {
      const targetField = customFieldMock;
      const fieldValueMock = {
        text: 'Homo homini lupus',
      } as TextFieldValue;

      expect(customFieldMock.value.text).toEqual(textMock);

      const updateField = updateCustomFieldValue(customFieldsMock, targetField, fieldValueMock).find(
        it => it.id === targetField.id
      );
      expect((updateField as CustomFieldText)?.value?.text).toEqual(fieldValueMock.text);
    });

    it('should update integer custom field value in the array of custom fields', async () => {
      const targetField = customFieldsMock[1];
      const fieldValueMock = 9999;

      expect(customFieldMock.value.text).toEqual(textMock);

      const updateField = updateCustomFieldValue(customFieldsMock, targetField, fieldValueMock).find(
        it => it.id === targetField.id
      );
      expect((updateField as CustomFieldText).value).toEqual(9999);
    });
  });

  describe('Custom field type', () => {
    it('should get project custom field type', () => {
      const pcf: ProjectCustomField = mocks.createProjectCustomFieldMock();

      expect(getFieldType(pcf)).toEqual(pcf.field.fieldType.valueType);
    });

    it('should get custom field type', () => {
      const type = mocks.createFieldTypeMock({valueType: 'custom'});
      const cf = {fieldType: mocks.createFieldTypeMock(type)} as ICustomField;

      expect(getFieldType(cf)).toEqual('custom');
    });

    it('should return NULL if parameter is NULL', () => {
      expect(getFieldType(null)).toEqual(null);
    });

    it('should return NULL if parameter is not provided', () => {
      expect(getFieldType(undefined as any)).toEqual(null);
    });

    it('should not throw and return NULL', () => {
      expect(getFieldType({} as ICustomField)).toEqual(null);
    });

    it('should return NULL if no `fildType` is provided', () => {
      expect(getFieldType({field: {}} as ProjectCustomField)).toEqual(null);
    });
  });
});
