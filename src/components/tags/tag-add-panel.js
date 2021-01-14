/* @flow */

import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import IconTag from '../icon/assets/tag.svg';

import {HIT_SLOP} from '../common-styles/button';

import styles from './tags.styles';

type Props = {
  onAdd: () => any
}


const TagAddPanel = (props: Props) => {
  //$FlowFixMe
  const iconTag = <IconTag style={styles.tagIcon} width={16} height={16} fill={styles.buttonText.color}/>;
  return (
    <TouchableOpacity
      style={styles.button}
      hitSlop={HIT_SLOP}
      onPress={props.onAdd}
    >
      {iconTag}
      <Text
        style={styles.buttonText}>
        Add Tag
      </Text>
    </TouchableOpacity>
  );
};

export default React.memo<Props>(TagAddPanel);

