/* @flow */

import type {
  CustomField,
  CustomFieldBase,
  CustomFieldText,
  CustomFieldValue,
  ProjectCustomField,
} from '../../flow/CustomFields';

type AnyCustomField = $Shape<CustomField & CustomFieldText>;


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

const getIssueTextCustomFields = (issueCustomFields: Array<AnyCustomField> = []): Array<CustomFieldText> => (
  issueCustomFields.filter((field: AnyCustomField) => isTextCustomField(field.projectCustomField))
);

const getIssueCustomFieldsNotText = (issueCustomFields: Array<AnyCustomField> = []): Array<CustomField> => (
  issueCustomFields.filter((field: AnyCustomField) => !isTextCustomField(field.projectCustomField))
);

const updateCustomFieldValue = (
  fields: Array<AnyCustomField> = [],
  cf: AnyCustomField,
  value: CustomFieldValue,
): Array<AnyCustomField> => {
  const index: number = fields.findIndex((f: AnyCustomField) => f.id === cf.id);
  return (
    index >= 0
      ? [
        ...fields.slice(0, index),
        {...fields[index], value},
        ...fields.slice(index + 1),
      ]
      : fields
  );
};

const getCustomFieldName = (customField: AnyCustomField) => {
  return customField?.localizedName || customField?.name || '';
};

export {
  getCustomFieldName,
  getIssueTextCustomFields,
  getIssueCustomFieldsNotText,
  getSimpleCustomFieldType,
  isTextCustomField,
  isRequiredCustomField,
  updateCustomFieldValue,
};
