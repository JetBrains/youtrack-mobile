import React from 'react';
import {View} from 'react-native';
import separatorStyles from './separator.styles';
import type {ViewStyleProp} from 'flow/Internal';
type Props = {
  fitWindow?: boolean;
  indent?: boolean;
  styles?: ViewStyleProp;
};

const Separator = (props: Props) => {
  const {styles, indent, fitWindow, ...rest} = props;
  return (
    <View
      {...rest}
      style={[
        fitWindow
          ? separatorStyles.rowSeparatorFit
          : separatorStyles.rowSeparator,
        indent && separatorStyles.indent,
        styles,
      ]}
    />
  );
};

export default React.memo<Props>(Separator) as React$AbstractComponent<
  Props,
  unknown
>;
