import guid from 'react-native-device-log/guid';

export function createFieldTypeMock(fields) {
  const defaultFields = {
    $type: 'FieldType',
    isMultiValue: false,
    valueType: 'integer',
  };
  return {...defaultFields, ...fields};
}

export function createCustomFieldMock(fields) {
  const defaultFields = {
    $type: 'CustomField',
    fieldType: createFieldTypeMock(),
    id: guid(),
    localizedName: null,
    name: 'FieldName',
  };

  return {...defaultFields, ...fields};
}

export function createProjectCustomFieldMock(fields) {
  const defaultFields = {
    $type: 'SimpleProjectCustomField',
    canBeEmpty: true,
    emptyFieldText: 'EMPTY FIELD TEXT',
    field: createCustomFieldMock(),
    id: guid(),
  };

  return {...defaultFields, ...fields};
}
