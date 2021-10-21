/* @flow */

import type {CustomField, CustomFieldBase, CustomFieldText, ProjectCustomField} from '../../flow/CustomFields';

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

const isRequiredCustomField = (customField: CustomFieldBase | CustomFieldText | CustomField): boolean => {
    if (!customField || !customField?.projectCustomField) {
      return false;
    }
    return !customField.projectCustomField.canBeEmpty;
};

const getIssueTextCustomFields = (issueCustomFields: Array<CustomField | CustomFieldText> = []): Array<CustomFieldText> => (
  issueCustomFields.filter((field: CustomField | CustomFieldText) => isTextCustomField(field.projectCustomField))
);

export {
  getIssueTextCustomFields,
  getSimpleCustomFieldType,
  isTextCustomField,
  isRequiredCustomField,
};
