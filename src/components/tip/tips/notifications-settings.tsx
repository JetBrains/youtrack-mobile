import React from 'react';

import {View} from 'react-native';

// @ts-ignore
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import {View as AnimatedView} from 'react-native-animatable';

import Tip from 'components/tip/tip';
import {flushStoragePart, getStorageState} from 'components/storage/storage';
import {i18n} from 'components/i18n/i18n';

import styles from '../tip.styles';

const TipNotificationsSettingsAndSwipes = () => {
  const [isDismissed, updateDismissed] = React.useState<boolean | null>(
    getStorageState().dismissNotificationsSettingsAndSwipes,
  );

  const dismiss = () => {
    updateDismissed(true);
    flushStoragePart({dismissNotificationsSettingsAndSwipes: true});
  };

  return isDismissed ? null : (
    <AnimatedView useNativeDriver duration={800} animation="fadeIn" style={[
      styles.tipBox,
      styles.tipNotificationSettings,
    ]}>
      <View style={styles.tipCollout} />
      <Tip
        icon={<IconMaterial style={styles.tipIcon} name="gesture-swipe-right" size={28} color={styles.tipText.color} />}
        text={i18n(
          'Activate the "Unread only" option to filter your notifications, then swipe right to mark them as read and keep your list clean.',
        )}
        onClose={dismiss}
      />
    </AnimatedView>
  );
};

export default TipNotificationsSettingsAndSwipes;
