import React from 'react';

// @ts-ignore
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import {View as AnimatedView} from 'react-native-animatable';

import Tip from 'components/tip/tip';
import {flushStoragePart, getStorageState} from 'components/storage/storage';
import {i18n} from 'components/i18n/i18n';

import styles from '../tip.styles';
import {UNIT} from 'components/variables';

export default function TipActivityActionAccessTouch({canAddComment}: {canAddComment: boolean | undefined}) {
  const [isDismissed, updateDismissed] = React.useState<boolean | null>(
    getStorageState().dismissActivityActionAccessTouch,
  );

  return isDismissed ? null : (
    <AnimatedView
      useNativeDriver
      duration={800}
      animation="fadeIn"
      style={[styles.tipBox, styles.tipStreamActions, canAddComment ? {bottom: UNIT * 7.5} : null]}
    >
      <Tip
        icon={<IconMaterial style={styles.tipIcon} name="gesture-tap-hold" size={28} color={styles.tipText.color} />}
        text={i18n('Touch and hold an item to view a list of available actions')}
        onClose={() => {
          updateDismissed(true);
          flushStoragePart({dismissActivityActionAccessTouch: true});
        }}
      />
    </AnimatedView>
  );
}
