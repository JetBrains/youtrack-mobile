/* @flow */

import React, {Component} from 'react';
import {View, TextInput} from 'react-native';

import throttle from 'lodash.throttle';

import TextEditForm from './text-edit-form';

import styles from './summary-description-form.style';

import type {UITheme} from '../../flow/Theme';

type Props = {
  editable: boolean,
  summary: string,
  description: string,
  onSummaryChange: (summary: string) => any,
  onDescriptionChange: (description: string) => any,
  uiTheme: UITheme,
  summaryPlaceholder?: string,
  descriptionPlaceholder?: string,
}

const TEXT_UPDATE_DEBOUNCE = 300;

export default class SummaryDescriptionForm extends Component<Props, void> {
  onSummaryChange = throttle((text: string) => (
    this.props.onSummaryChange(text)
  ), TEXT_UPDATE_DEBOUNCE);

  onDescriptionChange = throttle((text: string) => (
    this.props.onDescriptionChange(text)
  ), TEXT_UPDATE_DEBOUNCE);

  render() {
    const {
      editable,
      summary,
      description,
      uiTheme,
      summaryPlaceholder = 'Summary',
      descriptionPlaceholder = 'Description',
      onSummaryChange, //eslint-disable-line no-unused-vars
      onDescriptionChange, //eslint-disable-line no-unused-vars
      ...rest
    } = this.props;

    return (
      <View {...rest}>
        <TextInput
          style={styles.summary}
          multiline={true}
          editable={editable}
          autoFocus
          placeholder={summaryPlaceholder}
          placeholderTextColor={uiTheme.colors.$icon}
          underlineColorAndroid="transparent"
          keyboardAppearance={uiTheme.name}
          returnKeyType="next"
          autoCapitalize="sentences"
          defaultValue={summary}
          onChangeText={this.onSummaryChange}
        />

        <View style={styles.separator} />

        <TextEditForm
          editable={editable}
          description={description}
          placeholderText={descriptionPlaceholder}
          multiline={true}
          onDescriptionChange={this.onDescriptionChange}
          uiTheme={uiTheme}
        />
      </View>
    );
  }
}
