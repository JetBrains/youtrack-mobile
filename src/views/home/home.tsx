import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';

import usage from 'components/usage/usage';
import {formatYouTrackURL} from 'components/config/config';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {logo, IconPencil} from 'components/icon/icon';

import styles from './home.styles';

interface Props {
  backendUrl: string;
  message?: string;
  error?: {message: string};
  onChangeBackendUrl: (newUrl: string) => any;
  onRetry: () => any;
}

const Home = (props: Props) => {
  usage.trackScreenView('HomeLoading');
  const {backendUrl, onChangeBackendUrl, error, message, onRetry} = props;
  const errorMessage: string | undefined = error?.message || message;
  return (
    <View style={styles.container}>
      <Image style={styles.logoImage} source={logo} />
      <View style={styles.info}>
        {Boolean(errorMessage) && <Text style={[styles.message, error && styles.messageError]}>{errorMessage}</Text>}
        {Boolean(backendUrl) && (
          <TouchableOpacity hitSlop={HIT_SLOP} style={styles.urlButton} onPress={() => onChangeBackendUrl(backendUrl)}>
            <Text style={styles.url}>{formatYouTrackURL(backendUrl)}</Text>
            <IconPencil style={styles.editUrlIcon} size={22} color={styles.retry.color} />
          </TouchableOpacity>
        )}
        {Boolean(error) && (
          <TouchableOpacity onPress={onRetry}>
            <Text style={styles.retry}>{i18n('Retry')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default React.memo<Props>(Home);
