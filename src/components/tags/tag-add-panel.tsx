import React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import IconTag from '@jetbrains/icons/tag.svg';
import {i18n} from 'components/i18n/i18n';
import {HIT_SLOP} from '../common-styles/button';
import styles from './tags.styles';
type Props = {
  disabled?: boolean;
  onAdd: () => any;
};

const TagAddPanel = (props: Props) => {
  const iconTag: any = (
    <IconTag
      style={styles.tagIcon}
      width={21}
      height={21}
      fill={
        props.disabled
          ? styles.buttonTextDisabled.color
          : styles.buttonText.color
      }
    />
  );
  return (
    <TouchableOpacity
      testID="test:id/add-tag-button"
      accessibilityLabel="add-tag-button"
      accessible={true}
      disabled={props.disabled}
      style={styles.button}
      hitSlop={HIT_SLOP}
      onPress={props.onAdd}
    >
      {iconTag}
      <Text
        style={[styles.buttonText, props.disabled && styles.buttonTextDisabled]}
      >
        {i18n('Add tag')}
      </Text>
    </TouchableOpacity>
  );
};

export default React.memo<Props>(TagAddPanel) as React$AbstractComponent<
  Props,
  unknown
>;
