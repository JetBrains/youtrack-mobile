/* @flow */

import type {Node} from 'React';
import React, {Component} from 'react';
import {View, TextInput} from 'react-native';

import once from 'lodash.once';
import throttle from 'lodash.throttle';

import TextEditForm from './text-edit-form';
import usage from '../usage/usage';

import styles from './summary-description-form.style';

import type {UITheme} from '../../flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  analyticsId?: string,
  editable: boolean,
  summary: string,
  description: string,
  onSummaryChange: (summary: string) => any,
  onDescriptionChange: (description: string) => any,
  uiTheme: UITheme,
  summaryPlaceholder?: string,
  descriptionPlaceholder?: string,
  style?: ViewStyleProp,
}

const TEXT_UPDATE_DEBOUNCE = 300;

export default class SummaryDescriptionForm extends Component<Props, void> {
  trackChange: ((message: string) => any | boolean) = (message: string) => (
    typeof this.props.analyticsId === 'string' && usage.trackEvent(this.props.analyticsId, message)
  );
  trackSummaryChange: any = once(() => this.trackChange('Summary updated'));
  trackDescriptionChange: any = once(() => this.trackChange('Description updated'));

  onSummaryChange: any = throttle((text: string) => {
    this.trackSummaryChange();
    return this.props.onSummaryChange(text);
  }, TEXT_UPDATE_DEBOUNCE);

  onDescriptionChange: any = throttle((text: string) => {
    this.trackDescriptionChange();
    return this.props.onDescriptionChange(text);
  }, TEXT_UPDATE_DEBOUNCE);

  render(): Node {
    const {
      editable,
      summary,
      description,
      uiTheme,
      summaryPlaceholder = 'Summary',
      descriptionPlaceholder = 'Description',
      onSummaryChange, //eslint-disable-line no-unused-vars
      onDescriptionChange, //eslint-disable-line no-unused-vars
      analyticsId, //eslint-disable-line no-unused-vars
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

        <View style={styles.separator}/>

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
