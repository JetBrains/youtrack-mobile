import React, {useState, useCallback} from 'react';
import {Text} from 'react-native';

import {IconCheckboxBlank, IconCheckboxChecked} from 'components/icon/icon';

import type {TextProps} from 'react-native';

import styles from './markdown.styles';

interface Props extends React.PropsWithChildren {
  checked: boolean;
  enabled: boolean;
  onCheckboxUpdate?: (checked: boolean, position: number) => void;
  position: number;
}

const MarkdownCheckbox = ({
  checked,
  children,
  enabled,
  onCheckboxUpdate,
  position,
}: Props) => {
  const [isChecked, setIsChecked] = useState<boolean>(checked);
  const CheckboxIcon = isChecked ? IconCheckboxChecked : IconCheckboxBlank;

  const onPress = useCallback(() => {
    if (enabled) {
      setIsChecked(!isChecked);
      onCheckboxUpdate?.(!isChecked, position);
    }
  }, [enabled, isChecked, onCheckboxUpdate, position]);

  const textProps: TextProps  = {
    style: styles.checkboxIconContainer,
  };
  if (enabled) {
    textProps.onPress = onPress;
  }

  return (
    <>
      <Text {...textProps}>
        <CheckboxIcon size={24} style={[styles.checkboxIcon, !isChecked && styles.checkboxIconBlank]} />
      </Text>
      {children}
    </>
  );
};

export default MarkdownCheckbox;
