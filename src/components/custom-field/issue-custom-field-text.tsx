import React, {useCallback, useEffect, useRef} from 'react';
import {Text, View} from 'react-native';
import IssueMarkdown from 'views/issue/issue__markdown';
import TextEditForm from '../form/text-edit-form';
import {isRequiredCustomField} from './custom-field-helper';
import styles from './custom-field.styles';
import type {CustomFieldText} from 'flow/CustomFields';
import type {Node} from 'react';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
type Props = {
  editMode: boolean;
  onUpdateFieldValue: (textValue: string) => Promise<any>;
  textField: CustomFieldText;
  style?: ViewStyleProp;
  usesMarkdown: boolean;
};

const IssueCustomFieldText = (props: Props): Node => {
  const timeout: {
    current: TimeoutID | null | undefined;
  } = useRef(null);
  useEffect(() => {
    return clearTimeout(timeout.current);
  }, [timeout]);
  const onChange = useCallback(
    (text: string) => {
      timeout.current = setTimeout(() => {
        props.onUpdateFieldValue(text.trim());
      }, 300);
    },
    [props],
  );
  const fieldValue: string = props.textField?.value?.text || '';

  if (!props.editMode && !fieldValue) {
    return null;
  }

  return (
    <View style={[styles.issueTextField, props.style]}>
      <Text style={styles.issueTextFieldTitle}>
        {props.textField?.name}
        {isRequiredCustomField(props.textField) && (
          <Text style={styles.error}> *</Text>
        )}
      </Text>

      {props.editMode && (
        <TextEditForm
          editable={true}
          description={fieldValue}
          placeholderText={
            props.textField.projectCustomField.emptyFieldText || ''
          }
          multiline={true}
          onDescriptionChange={(text: string) => {
            onChange(text);
          }}
        />
      )}

      {!props.editMode && (
        <IssueMarkdown
          markdown={props.usesMarkdown ? fieldValue : null}
          youtrackWiki={{
            description: props.usesMarkdown ? null : fieldValue,
          }}
        />
      )}
    </View>
  );
};

export default React.memo<Props>(
  IssueCustomFieldText,
) as React$AbstractComponent<Props, unknown>;