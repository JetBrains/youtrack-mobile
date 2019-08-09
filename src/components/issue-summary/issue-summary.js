/* @flow */
import React, {Component} from 'react';
import {View, TextInput} from 'react-native';
import throttle from 'lodash.throttle';
import styles from './issue-summary.styles';
import MultilineInput from '../multiline-input/multiline-input';
import {COLOR_FONT_GRAY} from '../variables/variables';

type Props = {
  editable: boolean,
  showSeparator: boolean,
  summary: string,
  description: string,
  onSummaryChange: (summary: string) => any,
  onDescriptionChange: (description: string) => any
}

const TEXT_UPDATE_DEBOUNCE = 300;

export default class IssueSummary extends Component<Props, void> {
  descriptionInput: MultilineInput;

  descriptionInputRef = (instance: ?MultilineInput) => {
    if (instance) {
      this.descriptionInput = instance;
    }
  };

  onSummaryChange = throttle((text: string) => (
    this.props.onSummaryChange(text)
  ), TEXT_UPDATE_DEBOUNCE);

  onDescriptionChange = throttle((text: string) => (
    this.props.onDescriptionChange(text)
  ), TEXT_UPDATE_DEBOUNCE);

  render() {
    // eslint-disable-next-line no-unused-vars
    const {editable, showSeparator, summary, description, onDescriptionChange, onSummaryChange, ...rest} = this.props;

    return (
      <View {...rest}>
        <TextInput
          style={styles.summaryInput}
          editable={editable}
          autoFocus
          placeholder="Summary"
          placeholderTextColor={COLOR_FONT_GRAY}
          underlineColorAndroid="transparent"
          keyboardAppearance="dark"
          returnKeyType="next"
          autoCapitalize="sentences"
          defaultValue={summary}
          onSubmitEditing={() => this.descriptionInput.focus()}
          onChangeText={this.onSummaryChange}
        />

        {showSeparator && <View style={styles.separator} />}

        <MultilineInput
          ref={this.descriptionInputRef}
          maxInputHeight={0}
          scrollEnabled={false}
          editable={editable}
          autoCapitalize="sentences"
          placeholderTextColor={COLOR_FONT_GRAY}
          placeholder="Description"
          keyboardAppearance="dark"
          style={styles.descriptionInput}
          multiline={true}
          underlineColorAndroid="transparent"
          defaultValue={description}
          onChangeText={this.onDescriptionChange}
        />
      </View>
    );
  }
}
