import * as React from 'react';

import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import {View as AnimatedView} from 'react-native-animatable';

import Tip from 'components/tip/tip';
import {flushStoragePart, getStorageState} from 'components/storage/storage';
import {i18n} from 'components/i18n/i18n';

import styles from '../tip.styles';
import {UNIT} from 'components/variables';


export default function TipActivityActionAccessTouch({canAddComment}: {canAddComment: boolean | undefined}) {
  const [isDismissed, updateDismissed] = React.useState<boolean | null>(
    getStorageState().dismissActivityActionAccessTouch
  );

  return isDismissed ? null : (
    <AnimatedView useNativeDriver duration={800} animation="fadeIn">
      <Tip
        style={{...styles.tipStreamActions, ...(canAddComment && {bottom: UNIT * 7.5})}}
        icon={<IconMaterial
          style={{...styles.tipIcon, color: styles.tipText.color, position: 'relative', top: -2, marginRight: 12}}
          name="gesture-tap-hold"
          size={28}
          color={styles.tipText.color}/>}
        text={i18n('Touch and hold an item to view a list of available actions')}
        onClose={() => {
          updateDismissed(true);
          flushStoragePart({dismissActivityActionAccessTouch: true});
        }}
      />
    </AnimatedView>
  );
}
