/* @flow */

import React, {useCallback, useEffect, useRef} from 'react';
import {Text, View} from 'react-native';

import IssueMarkdown from '../../views/issue/issue__markdown';
import TextEditForm from '../form/text-edit-form';
import {isRequiredCustomField} from './custom-field-helper';

import styles from './custom-field.styles';

import type {CustomFieldText} from '../../flow/CustomFields';
import type {Node} from 'react';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  editMode: boolean,
  onUpdateFieldValue: (textValue: string) => Promise<any>,
  textField: CustomFieldText,
  style?: ViewStyleProp,
  usesMarkdown: boolean,
};

const IssueCustomFieldText = (props: Props): Node => {
  const timeout: { current: ?TimeoutID } = useRef(null);

  useEffect(() => {
    return clearTimeout(timeout.current);
  }, [timeout]);


  const onChange = useCallback((text: string) => {
    timeout.current = setTimeout(() => {props.onUpdateFieldValue(text);}, 300);
  }, [props]);

  return (
    <View
      style={[styles.issueTextField, props.style]}
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
        onDescriptionChange={(fieldValue: string) => {onChange(fieldValue);}}
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
