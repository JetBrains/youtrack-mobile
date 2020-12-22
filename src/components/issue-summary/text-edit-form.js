/* @flow */

import React, {PureComponent} from 'react';

import throttle from 'lodash.throttle';

import MultilineInput from '../multiline-input/multiline-input';

import styles from './issue-summary.styles';

import type {UITheme} from '../../flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  adaptive?: boolean,
  autoFocus: boolean,
  editable: boolean,
  description: string,
  placeholderText?: string,
  multiline: boolean,
  onDescriptionChange: ?(text: string) => any,
  style?: ViewStyleProp,
  uiTheme: UITheme
}

const TEXT_UPDATE_DEBOUNCE = 300;

export default class TextEditForm extends PureComponent<Props, void> {
  descriptionInput: MultilineInput;

  descriptionInputRef = (instance: ?MultilineInput) => {
    if (instance) {
      this.descriptionInput = instance;
    }
  };

  onDescriptionChange = throttle((text: string) => {
    const {onDescriptionChange} = this.props;
    return onDescriptionChange && onDescriptionChange(text);
  }, TEXT_UPDATE_DEBOUNCE);

  render() {
    const {
      adaptive = false,
      autoFocus = false,
      description,
      editable = false,
      multiline = true,
      placeholderText = 'Description',
      style,
      uiTheme
    } = this.props;

    return (
      <MultilineInput
        style={[styles.descriptionInput, style]}
        ref={this.descriptionInputRef}
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
      />
    );
  }
}
