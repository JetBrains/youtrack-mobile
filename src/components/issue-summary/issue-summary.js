/* @flow */
import React, {Component} from 'react';
import {View, TextInput} from 'react-native';
import styles from './issue-summary.styles';
import MultilineInput from '../multiline-input/multiline-input';

type Props = {
  editable: boolean,
  showSeparator: boolean,
  summary: string,
  description: string,
  onSummaryChange: (summary: string) => any,
  onDescriptionChange: (description: string) => any
}

export default class AttachmentsRow extends Component {
  props: Props;
  descriptionInput: MultilineInput;

  render() {
    const {editable, showSeparator, summary, description, ...rest} = this.props;

    return (
      <View {...rest}>
        <TextInput
          style={styles.summaryInput}
          editable={editable}
          autoFocus
          placeholder="Summary"
          underlineColorAndroid="transparent"
          keyboardAppearance="dark"
          returnKeyType="next"
          autoCapitalize="sentences"
          value={summary}
          onSubmitEditing={() => this.descriptionInput.focus()}
          onChangeText={this.props.onSummaryChange} />

        {showSeparator && <View style={styles.separator} />}

        <MultilineInput
          ref={instance => this.descriptionInput = instance}
          maxInputHeight={0}
          editable={editable}
          autoCapitalize="sentences"
          keyboardAppearance="dark"
          style={styles.descriptionInput}
          multiline={true}
          underlineColorAndroid="transparent"
          placeholder="Description"
          value={description}
          onChangeText={this.props.onDescriptionChange} />
      </View>
    );
  }
}
