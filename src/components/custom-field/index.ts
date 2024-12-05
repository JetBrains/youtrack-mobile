import {getApi} from 'components/api/api__instance';

import type {CustomField, FieldValue} from 'types/CustomFields';
import type {ISelectProps} from 'components/select/select';
import type {Project} from 'types/Project';
import type {UserGroup} from 'types/UserGroup';
import type {User} from 'types/User';

export type SelectExtendedType = {description?: string; icon?: string};
export type UserCustomFieldSelect = User & SelectExtendedType;
export type CustomFieldSelect =
  | UserGroup
  | UserCustomFieldSelect
  | Project
  | {
      id: string;
      name: string;
    };

const addDescriptionAndIcon = (f: User | UserGroup) => {
  let it = f as UserCustomFieldSelect;
  if (it.email) {
    it = {...it, description: it.email};
  }
  if (it?.issueRelatedGroup?.icon) {
    it = {...it, icon: it.issueRelatedGroup.icon};
  }
  return it;
};

export const getCustomFieldSelectProps = ({
  field,
  onChangeSelection,
  onSelect,
  issueId,
}: {
  field: CustomField;
  onChangeSelection: (selectedItems: CustomFieldSelect[], current: CustomFieldSelect) => void;
  onSelect: (value: FieldValue) => void;
  issueId?: string;
}): ISelectProps<CustomFieldSelect> => {
  const projectCustomField = field.projectCustomField;

  return {
    multi: projectCustomField.field.fieldType.isMultiValue,
    selectedItems: new Array().concat(field.value).filter(Boolean).map(addDescriptionAndIcon),
    emptyValue: projectCustomField.canBeEmpty ? projectCustomField.emptyFieldText : null,
    dataSource: async () => {
      if (field.hasStateMachine && issueId) {
        const items = await getApi().getStateMachineEvents(issueId, field.id);
        return items.map(it => ({id: it.id, name: `${it.id} (${it.presentation})`}));
      }

      const fieldValueType = projectCustomField.field.fieldType.valueType;
      const customFieldValues = await getApi().getCustomFieldValues(projectCustomField?.bundle?.id, fieldValueType);
      if (fieldValueType === 'user') {
        return customFieldValues.map(addDescriptionAndIcon);
      }
      return customFieldValues;
    },
    onChangeSelection,
    onSelect,
  };
};
