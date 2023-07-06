import React from 'react';
import {TouchableOpacity} from 'react-native';

import {HIT_SLOP} from 'components/common-styles/button';
import {IconStar, IconStarOutline} from 'components/icon/icon';

import styles from './star.styles';

type Props = {
  disabled?: boolean;
  canStar: boolean;
  hasStar: boolean;
  onStarToggle: (starred: boolean) => any;
  style?: any;
  size?: number;
};


const Star = (props: Props): React.JSX.Element | null => {
  const {hasStar, canStar, style, size = 19, disabled = false, onStarToggle} = props;

  const toggle = () => {
    if (onStarToggle) {
      onStarToggle(!hasStar);
    }
  };

  return !canStar ? null : (
    <TouchableOpacity
      disabled={disabled}
      hitSlop={HIT_SLOP}
      style={style}
      onPress={toggle}
    >
      {hasStar ? (
        <IconStar size={size} color={styles.link.color}/>
      ) : (
        <IconStarOutline size={size} color={styles.inactive.color}/>
      )}
    </TouchableOpacity>
  );
};


export default React.memo(Star);
