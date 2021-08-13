/* @flow */

import React, {useState} from 'react';
import {Text, TouchableOpacity} from 'react-native';

import {IconChevronDownUp} from '../icon/icon';

import styles from './details.styles';

import type {Node} from 'React';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  renderer: () => any,
  style?: ViewStyleProp,
  title?: ?string,
}


const Details = (props: Props): Node => {
  const [expanded, updateExpanded] = useState(false);

  return (
    <>
      <TouchableOpacity
        testID="details"
        style={styles.button}
        onPress={() => updateExpanded(!expanded)}>
        {!!props.title && <Text style={styles.title}>
          {`${props.title}: `}
        </Text>}
        <Text style={styles.toggle}>
          Details
          <IconChevronDownUp size={13} isDown={!expanded} color={styles.toggle.color}/>
        </Text>
      </TouchableOpacity>

    {expanded && props.renderer()}
    </>
);
};

export default React.memo<Props>(Details);
