import React from 'react';
import {TouchableOpacity} from 'react-native';

import IconStar from '@jetbrains/icons/star-empty-20px.svg';
import {HIT_SLOP} from 'components/common-styles/button';

import styles from './star.styles';

type Props = {
  disabled?: boolean;
  canStar: boolean;
  hasStar: boolean;
  onStarToggle?: (starred: boolean) => any;
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
      <IconStar width={size} height={size} color={hasStar ? styles.link.color : styles.inactive.color}/>
    </TouchableOpacity>
  );
};


export default React.memo(Star);
