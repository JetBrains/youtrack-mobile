import React, {Component} from 'react';
import {View, TextInput} from 'react-native';
import once from 'lodash.once';
import throttle from 'lodash.throttle';
import TextEditForm from './text-edit-form';
import usage from '../usage/usage';
import {ThemeContext} from '../theme/theme-context';
import styles from './summary-description-form.style';
import type {Theme} from 'types/Theme';
import type {ViewStyleProp} from 'types/Internal';
type Props = {
  analyticsId?: string;
  editable: boolean;
  summary: string;
  description: string;
  onSummaryChange: (summary: string) => any;
  onDescriptionChange: (description: string) => any;
  summaryPlaceholder?: string;
  descriptionPlaceholder?: string;
  style?: ViewStyleProp;
  testID?: string;
};
const DELAY: number = 300;
export default class SummaryDescriptionForm extends Component<Props, void> {
  trackChange: (message: string) => any | boolean = (message: string) =>
    typeof this.props.analyticsId === 'string' &&
    usage.trackEvent(this.props.analyticsId, message);
  trackSummaryChange: any = once(() => this.trackChange('Summary updated'));
  trackDescriptionChange: any = once(() =>
    this.trackChange('Description updated'),
  );
  onSummaryChange: any = throttle((text: string) => {
    this.trackSummaryChange();
    return this.props.onSummaryChange(text);
  }, DELAY);
  onDescriptionChange: any = throttle((text: string) => {
    this.trackDescriptionChange();
    return this.props.onDescriptionChange(text);
  }, DELAY);

  render(): React.ReactNode {
    const {
      editable,
      summary,
      description,
      summaryPlaceholder = 'Summary',
      descriptionPlaceholder = 'Description',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onSummaryChange,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onDescriptionChange,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      analyticsId,

      ...rest
    } = this.props;
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          return (
            <View {...rest}>
              <TextInput
                style={styles.summary}
                multiline={true}
                editable={editable}
                autoFocus
                testID="test:id/issue-summary"
                accessibilityLabel="issue-summary"
                accessible={true}
                placeholder={summaryPlaceholder}
                placeholderTextColor={styles.placeholder.color}
                underlineColorAndroid="transparent"
                keyboardAppearance={theme.uiTheme?.name || 'dark'}
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
              />
            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}
