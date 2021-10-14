/* @flow */

import type {CustomField, ProjectCustomField} from '../../flow/CustomFields';

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

const isTextCustomField = (customField: ProjectCustomField): boolean => {
  if (!customField) {
    return false;
  }
  const valueType: ?string = getSimpleCustomFieldType(customField);
  return valueType ? valueType === 'text' : false;
};

const isRequiredCustomField = (issueField: CustomField): boolean => {
    if (!issueField || !issueField?.projectCustomField) {
      return false;
    }
    return !issueField.projectCustomField.canBeEmpty;
};

export {
  getSimpleCustomFieldType,
  isTextCustomField,
  isRequiredCustomField,
};
