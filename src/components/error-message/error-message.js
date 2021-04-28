/* @flow */

import type {Node} from 'React';
import React, {PureComponent} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {DEFAULT_ERROR_MESSAGE} from '../error/error-messages';
import {ERROR_MESSAGE_DATA} from '../error/error-message-data';
import {HTTP_STATUS} from '../error/error-http-codes';
import {IconSearch} from '../icon/icon';
import {extractErrorMessage, resolveError} from '../error/error-resolver';

import {styles} from './error-message.style';

import type {CustomError, ErrorMessageData} from '../../flow/Error';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  error?: CustomError,
  errorMessageData?: ErrorMessageData,
  onTryAgain?: Function,
  style?: ViewStyleProp,
  testID?: string,
};

type State = {
  errorMessageData: ErrorMessageData
}

export default class ErrorMessage extends PureComponent<Props, State> {
  state: State = {};

  async componentDidMount() {
    let errorMessage: ErrorMessageData;

    if (this.props.errorMessageData) {
      errorMessage = this.props.errorMessageData;
    } else if (this.props.error) {
      const error: CustomError = await resolveError(this.props.error);
      errorMessage = {
        title: ERROR_MESSAGE_DATA[error.status || error.error]?.title || error.message || error.error_message || '',
        description: extractErrorMessage(error, true),
      };
    }

    this.setState({
      errorMessageData: errorMessage,
    });
  }

  render(): null | Node {
    const {errorMessageData} = this.state;
    const {onTryAgain, style, testID} = this.props;

    if (!errorMessageData) {
      return null;
    }

    const Icon = errorMessageData.icon ? errorMessageData.icon : IconSearch;
    const iconSize = errorMessageData.iconSize || 80;

    return (
      <View
        testID={testID || 'error'}
        style={[styles.errorContainer, style]}
      >

        <Icon size={iconSize} color={EStyleSheet.value('$navigation')}/>

        <Text
          testID="error-message"
          style={styles.errorTitle}
        >
          {errorMessageData?.title}
        </Text>
        {Boolean(errorMessageData.description) && (
          <View>
            <Text style={styles.errorDescription}>{errorMessageData.description}</Text>
          </View>
        )}

        {!!onTryAgain && (
          <TouchableOpacity
            style={styles.tryAgainButton}
            onPress={onTryAgain}
          >
            <Text style={styles.tryAgainText}>Try Again</Text>
          </TouchableOpacity>
        )}

      </View>
    );
  }
}


function isForbiddenError(error: CustomError): boolean {
  return !!error.status && [HTTP_STATUS.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN].includes(error.status);
}

function isLicenceError(errorTitle: string = ''): boolean {
  return errorTitle === ERROR_MESSAGE_DATA.LICENSE_ERROR_RESPONSE.title;
}

function getErrorMessageData(error: CustomError) {
  const errorMessage = extractErrorMessage(error, true);
  return {
    title: error.error || error.error_message || error.message || DEFAULT_ERROR_MESSAGE,
    description: errorMessage,
  };
}


export async function getErrorData(error: CustomError): ErrorMessageData {
  const err = await resolveError(error);
  const errorMessageData: ErrorMessageData = getErrorMessageData(err);

  if (isForbiddenError(err) && isLicenceError(errorMessageData.title)) {
    errorMessageData.icon = ERROR_MESSAGE_DATA.LICENSE_ERROR_RESPONSE.icon;
  }
  return errorMessageData;
}
