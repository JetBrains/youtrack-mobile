import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import animation from 'components/animation/animation';
import {HIT_SLOP} from 'components/common-styles';
import {IconChevronDownUp} from 'components/icon/icon';

import styles from './details.styles';

import type {TextStyleProp} from 'types/Internal';

type Props = {
  renderer: () => any;
  style?: TextStyleProp;
  title?: string | null | undefined;
  toggler?: string | null | undefined;
};

const Details = (props: Props) => {
  const {toggler = 'Details', title, style, renderer} = props;
  const [expanded, updateExpanded] = React.useState(false);
  return (
    <>
      <View style={styles.container}>
        {!!title && (
          <Text style={styles.title}>{`${title}: `}</Text>
        )}
        <TouchableOpacity
          testID="details"
          style={styles.button}
          onPress={() => {
            animation.layoutAnimation();
            updateExpanded(!expanded);
          }}
          hitSlop={HIT_SLOP}
        >
          <Text style={[styles.buttonText, style]}>
            <IconChevronDownUp
              size={styles.buttonText.fontSize - 2}
              isDown={!expanded}
              color={props?.style?.color || styles.buttonText.color}
            />
            {toggler}
          </Text>
        </TouchableOpacity>
      </View>

      {expanded && renderer()}
    </>
  );
};

export default React.memo<Props>(Details);
