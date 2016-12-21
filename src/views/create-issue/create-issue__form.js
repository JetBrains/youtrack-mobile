/* @flow */
import React, {Component} from 'react';
import {View, TextInput} from 'react-native';
import styles from './create-issue.styles';
import MultilineInput from '../../components/multiline-input/multiline-input';

type Props = {
  editable: boolean,
  summary: string,
  description: string,
  onSummaryChange: (summary: string) => any,
  onDescriptionChange: (description: string) => any
}

export default class AttachmentsRow extends Component {
  props: Props;
  descriptionInput: MultilineInput;

  render() {
    const {editable, summary, description} = this.props;

    return (
      <View>
        <View>
          <TextInput
            style={styles.summaryInput}
            editable={editable}
            placeholder="Summary"
            underlineColorAndroid="transparent"
            returnKeyType="next"
            autoCapitalize="sentences"
            value={summary}
            onSubmitEditing={() => this.descriptionInput.focus()}
            onChangeText={this.props.onSummaryChange} />
        </View>
        <View style={styles.separator} />
        <View>
          <MultilineInput
            ref={instance => this.descriptionInput = instance}
            maxInputHeight={0}
            editable={editable}
            autoCapitalize="sentences"
            style={styles.descriptionInput}
            multiline={true}
            underlineColorAndroid="transparent"
            placeholder="Description"
            value={description}
            onChangeText={this.props.onDescriptionChange} />
        </View>
      </View>
    );
  }
}
