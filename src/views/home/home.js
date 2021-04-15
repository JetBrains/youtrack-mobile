/* @flow */

import React, {PureComponent} from 'react';
import {View, Image, Text, TouchableOpacity, ActivityIndicator} from 'react-native';

import usage from '../../components/usage/usage';
import {formatYouTrackURL} from '../../components/config/config';
import {logo, IconPencil} from '../../components/icon/icon';
import {ThemeContext} from '../../components/theme/theme-context';

import {HIT_SLOP} from '../../components/common-styles/button';
import styles from './home.styles';

import type {Theme} from '../../flow/Theme';

type Props = {
  backendUrl: string,
  message: string,
  error: string | {message: string},
  onChangeBackendUrl: (newUrl: string) => any,
  onRetry: () => any
};

type State = {
  youTrackBackendUrl: string
}

export default class Home extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      youTrackBackendUrl: props.backendUrl,
    };
    usage.trackScreenView('Loading');
  }

  render() {
    const {backendUrl, onChangeBackendUrl, error, message, onRetry} = this.props;
    return <ThemeContext.Consumer>
      {(theme: Theme) => {
        return (
          <View style={styles.container}>
            <Image style={styles.logoImage} source={logo}/>
            <View style={styles.info}>
              {Boolean(error || message) && (
                <Text style={[styles.message, error && styles.messageError]}>{error?.message || message}</Text>
              )}
              {Boolean(backendUrl) && (
                <TouchableOpacity
                  hitSlop={HIT_SLOP}
                  style={styles.urlButton}
                  onPress={() => onChangeBackendUrl(backendUrl)}>
                  <Text style={styles.url}>{formatYouTrackURL(backendUrl)}</Text>
                  <IconPencil style={styles.editUrlIcon} size={22} color={styles.retry.color}/>
                </TouchableOpacity>
              )}
              {Boolean(error) && (
                <TouchableOpacity
                  onPress={onRetry}>
                  <Text style={styles.retry}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>

          </View>
        );
      }}
    </ThemeContext.Consumer>;
  }
}
