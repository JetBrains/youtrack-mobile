import guid from 'react-native-device-log/guid';

function createFieldTypeMock(fields) {
  const defaultFields = {
    'valueType': 'integer',
    'isMultiValue': false,
    '$type': 'FieldType',
  };
  return {...defaultFields, ...fields};
}

function createCustomFieldMock(fields) {
  const defaultFields = {
    'name': 'FieldName',
    'ordinal': 8,
    'localizedName': null,
    'id': guid(),
    '$type': 'CustomField',
    'fieldType': createFieldTypeMock(),
  };

  return {...defaultFields, ...fields};
}

export function createProjectCustomFieldMock(fields) {
  const defaultFields = {
    id: guid(),
    ordinal: 1,
    emptyFieldText: 'EMPTY FIELD TEXT',
    canBeEmpty: true,
    $type: 'SimpleProjectCustomField',
    field: createCustomFieldMock(),
  };

  return {...defaultFields, ...fields};
}
