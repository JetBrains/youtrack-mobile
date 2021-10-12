/* @flow */

import type {ProjectCustomField} from '../../flow/CustomFields';

const isProjectCustomField = (customField: ProjectCustomField): boolean => {
  return customField?.$type ? customField.$type.indexOf('ProjectCustomField') !== -1 : false;
};

const getSimpleCustomFieldType = (customField: ?ProjectCustomField): ?string => {
  if (!customField) {
    return null;
  }
  const fieldType = isProjectCustomField(customField) ? customField.field.fieldType : customField.fieldType;
  return fieldType ? fieldType.valueType : null;
};


export {
  getSimpleCustomFieldType,
};
