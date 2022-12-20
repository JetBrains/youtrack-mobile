import React, {PureComponent} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {ERROR_MESSAGE_DATA} from '../error/error-message-data';
import {extractErrorMessage, resolveError} from '../error/error-resolver';
import {i18n} from 'components/i18n/i18n';
import {IconSearch} from '../icon/icon';
import {styles} from './error-message.style';
import type {CustomError, ErrorMessageData} from 'types/Error';
import type {ViewStyleProp} from 'types/Internal';
export type ErrorMessageProps = {
  error?: CustomError;
  errorMessageData?: ErrorMessageData | null;
  onTryAgain?: (...args: any[]) => any;
  style?: ViewStyleProp;
  testID?: string;
};
type State = {
  errorMessageData: ErrorMessageData | null;
};
export default class ErrorMessage extends PureComponent<
  ErrorMessageProps,
  State
> {
  state: State = {
    errorMessageData: null,
  };

  async setError() {
    let errorMessage: ErrorMessageData;

    if (this.props.errorMessageData) {
      errorMessage = this.props.errorMessageData;
    } else if (this.props.error) {
      const error: CustomError = await resolveError(this.props.error);
      errorMessage = {
        title:
          ERROR_MESSAGE_DATA[error.status || error.error]?.title ||
          error.message ||
          error.error_message ||
          '',
        description: extractErrorMessage(error, true),
      };
    }

    this.setState({
      errorMessageData: errorMessage,
    });
  }

  componentDidMount() {
    this.setError();
  }

  render(): React.ReactNode {
    const {errorMessageData} = this.state;
    const {onTryAgain, style, testID} = this.props;

    if (!errorMessageData) {
      return null;
    }

    const Icon = errorMessageData.icon ? errorMessageData.icon : IconSearch;
    const iconSize = errorMessageData.iconSize || 80;
    return (
      <View testID={testID || 'error'} style={[styles.errorContainer, style]}>
        <Icon size={iconSize} color={EStyleSheet.value('$navigation')} />

        <Text
          testID="test:id/error-message"
          accessibilityLabel="error-message"
          accessible={true}
          style={styles.errorTitle}
        >
          {errorMessageData?.title}
        </Text>
        {Boolean(errorMessageData.description) && (
          <View>
            <Text style={styles.errorDescription}>
              {errorMessageData.description}
            </Text>
          </View>
        )}

        {!!onTryAgain && (
          <TouchableOpacity style={styles.tryAgainButton} onPress={onTryAgain}>
            <Text style={styles.tryAgainText}>{i18n('Try Again')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}
