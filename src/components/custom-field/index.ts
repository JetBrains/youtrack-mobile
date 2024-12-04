import {getApi} from 'components/api/api__instance';

import type {CustomField, FieldValue} from 'types/CustomFields';
import type {ISelectProps} from 'components/select/select';
import type {UserGroup} from 'types/UserGroup';
import type {User} from 'types/User';

type SelectType = UserGroup | User | {id: string; name: string};

export const getCustomFieldSelectProps = ({
  field,
  onChangeSelection,
  onSelect,
  issueId,
}: {
  field: CustomField;
  onChangeSelection: (selectedItems: SelectType[], current: SelectType) => void;
  onSelect: (value: FieldValue) => void;
  issueId?: string;
}): ISelectProps<SelectType> => {
  const projectCustomField = field.projectCustomField;

  return {
    multi: projectCustomField.field.fieldType.isMultiValue,
    selectedItems: new Array().concat(field.value).filter(Boolean),
    emptyValue: projectCustomField.canBeEmpty ? projectCustomField.emptyFieldText : null,
    dataSource: async () => {
      if (field.hasStateMachine && issueId) {
        const items = await getApi().getStateMachineEvents(issueId, field.id);
        return items.map(it => ({id: it.id, name: `${it.id} (${it.presentation})`}));
      }

      return getApi().getCustomFieldValues(
        projectCustomField?.bundle?.id,
        projectCustomField.field.fieldType.valueType
      );
    },
    onChangeSelection,
    onSelect,
  };
};
