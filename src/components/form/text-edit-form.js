/* @flow */

import type {Node} from 'React';
import React, {PureComponent} from 'react';

import debounce from 'lodash.debounce';

import MultilineInput from '../multiline-input/multiline-input';

import styles from './summary-description-form.style';

import type {UITheme} from '../../flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  adaptive?: boolean,
  autoFocus?: boolean,
  editable: boolean,
  description: string,
  placeholderText?: string,
  multiline: boolean,
  onDescriptionChange: ?(text: string) => any,
  onSelectionChange?: (event: Object) => any,
  style?: ViewStyleProp,
  uiTheme: UITheme,
}


export default class TextEditForm extends PureComponent<Props, void> {

  onDescriptionChange: any = debounce((text: string) => {
    const {onDescriptionChange} = this.props;
    return onDescriptionChange && onDescriptionChange(text);
  }, 300);

  render(): Node {
    const {
      adaptive = false,
      autoFocus = false,
      description,
      editable = false,
      multiline = true,
      placeholderText = 'Description',
      style,
      uiTheme,
    } = this.props;

    return (
      <MultilineInput
        style={[styles.descriptionInput, style]}
        adaptive={adaptive}
        autoFocus={autoFocus}
        multiline={multiline}
        scrollEnabled={!adaptive}
        editable={editable}
        maxInputHeight={0}
        autoCapitalize="sentences"
        placeholderTextColor={uiTheme.colors.$icon}
        placeholder={placeholderText}
        textAlignVertical="top"
        keyboardAppearance={uiTheme.name}
        underlineColorAndroid="transparent"
        defaultValue={description}
        onChangeText={this.onDescriptionChange}
        onSelectionChange={(event: Object) => {
          if (this.props.onSelectionChange) {
            this.props.onSelectionChange(event);
          }
        }}
      />
    );
  }
}
