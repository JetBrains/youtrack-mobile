/* @flow */

import React from 'react';
import {Text, View} from 'react-native';

import IssueMarkdown from '../../views/issue/issue__markdown';
import TextEditForm from '../form/text-edit-form';
import {isRequiredCustomField} from './custom-field-helper';

import styles from './custom-field.styles';

import type {CustomFieldText} from '../../flow/CustomFields';
import type {Node} from 'react';

type Props = {
  editMode: boolean,
  onUpdateFieldValue: (textValue: string) => Promise<any>,
  textField: CustomFieldText,
  usesMarkdown: boolean,
};

const IssueCustomFieldText = (props: Props): Node => {
  return (
    <View
      style={styles.issueTextField}
    >
      <Text style={styles.issueTextFieldTitle}>
        {props.textField?.name}
        {isRequiredCustomField(props.textField) && <Text style={styles.error}> *</Text>}
      </Text>

      {props.editMode && <TextEditForm
        editable={true}
        description={props.textField?.value?.text || ''}
        placeholderText={props.textField.projectCustomField.emptyFieldText || ''}
        multiline={true}
        onDescriptionChange={(fieldValue: string) => {
          props.textField.value = {
            ...(props.textField.value) || {id: undefined},
            text: fieldValue,
          };
          props.onUpdateFieldValue(fieldValue);
        }}
      />}

      {!props.editMode && !!props.textField?.value?.text && (
        <IssueMarkdown
          markdown={props.usesMarkdown ? props.textField?.value?.text || '' : null}
          youtrackWiki={{
            description: props.usesMarkdown ? null : props.textField.value.text,
          }}
        />
      )}

    </View>
  );
};

export default (React.memo<Props>(IssueCustomFieldText): React$AbstractComponent<Props, mixed>);
