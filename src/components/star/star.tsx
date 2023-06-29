import React, {PureComponent} from 'react';
import {TouchableOpacity} from 'react-native';
import {HIT_SLOP} from '../common-styles/button';
import {IconStar, IconStarOutline} from '../icon/icon';
import styles from './star.styles';
type Props = {
  disabled?: boolean;
  canStar: boolean;
  hasStar: boolean;
  onStarToggle: (starred: boolean) => any;
  style?: any;
  size?: number;
};
export default class Star extends PureComponent<Props, void> {
  toggle: () => void = () => {
    const {hasStar, onStarToggle} = this.props;

    if (onStarToggle) {
      onStarToggle(!hasStar);
    }
  };

  render(): React.ReactNode {
    const {hasStar, canStar, style, size = 19, disabled = false} = this.props;

    if (!canStar) {
      return null;
    }

    return (
      <TouchableOpacity
        disabled={disabled}
        hitSlop={HIT_SLOP}
        style={style}
        onPress={this.toggle}
      >
        {hasStar ? (
          <IconStar size={size} color={styles.link.color} />
        ) : (
          <IconStarOutline size={size} color={styles.inactive.color} />
        )}
      </TouchableOpacity>
    );
  }
}
