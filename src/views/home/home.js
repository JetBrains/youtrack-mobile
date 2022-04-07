/* @flow */

import React from 'react';
import {View, Image, Text, TouchableOpacity} from 'react-native';

import usage from 'components/usage/usage';
import {formatYouTrackURL} from 'components/config/config';
import {HIT_SLOP} from 'components/common-styles/button';
import {logo, IconPencil} from 'components/icon/icon';

import styles from './home.styles';

import type {Node} from 'react';

type Props = {
  backendUrl: string,
  message?: string,
  error?: { message: string },
  onChangeBackendUrl: (newUrl: string) => any,
  onRetry: () => any
};


const Home = (props: Props): Node => {
  usage.trackScreenView('Loading');

  const {backendUrl, onChangeBackendUrl, error, message, onRetry} = props;
  const errorMessage: ?string = error?.message || message;
  return (
    <View style={styles.container}>
      <Image style={styles.logoImage} source={logo}/>
      <View style={styles.info}>
        {Boolean(errorMessage) && (
          <Text style={[styles.message, error && styles.messageError]}>{errorMessage}</Text>
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
};

export default (React.memo<Props>(Home): React$AbstractComponent<Props, mixed>);
