import mocks from '../../../test/mocks';
import {updateCustomFieldValue} from './custom-field-helper';


let customFieldMock;
let customFieldsMock;
let textMock;

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
      const fieldValueMock = {text: 'Homo homini lupus'};

      expect(customFieldMock.value.text).toEqual(textMock);
      const updateField = updateCustomFieldValue(customFieldsMock, targetField, fieldValueMock).find(
        (it) => it.id === targetField.id
      );
      expect(updateField.value.text).toEqual(fieldValueMock.text);
    });

    it('should update integer custom field value in the array of custom fields', async () => {
      const targetField = customFieldsMock[1];
      const fieldValueMock = 9999;

      expect(customFieldMock.value.text).toEqual(textMock);
      const updateField = updateCustomFieldValue(customFieldsMock, targetField, fieldValueMock).find(
        (it) => it.id === targetField.id
      );
      expect(updateField.value).toEqual(9999);
    });
  });
});
