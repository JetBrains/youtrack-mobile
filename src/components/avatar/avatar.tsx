import React from 'react';
import {Image, ImageErrorEventData, NativeSyntheticEvent, View} from 'react-native';

import {SvgUri} from 'react-native-svg';

import DefaultAvatar from './default-avatar';

import styles from './default-avatar.styles';

import {ViewStyleProp} from 'types/Internal';

interface Props {
  userName?: string;
  size: number;
  source: {
    uri: string;
  };
  style?: ViewStyleProp;
  testID?: string;
  accessibilityLabel?: string;
  accessible?: boolean;
}

interface State {
  renderDefault: boolean;
  renderSVG: boolean;
}

const errors = ['error decoding image data', 'unknown image format'];

const Avatar = (props: Props) => {
  const {source, userName = 'A', size, style, testID, accessibilityLabel, accessible} = props;

  const [state, setState] = React.useState<State>({
    renderDefault: !source.uri,
    renderSVG: false,
  });

  React.useEffect(() => {
    setState((st: State) => ({...st, renderDefault: !source.uri}));
  }, [source.uri]);

  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessible={accessible}
      style={[
        styles.common,
        style,
        {
          width: size,
          height: size,
          borderRadius: size,
          overflow: 'hidden',
        },
      ]}
    >
      {state.renderSVG && (
        <SvgUri
          width={size}
          height={size}
          uri={source.uri}
          onError={() =>
            setState({
              renderSVG: false,
              renderDefault: true,
            })
          }
        />
      )}
      {state.renderDefault && <DefaultAvatar size={size} text={userName} style={[styles.common, style]} />}
      {!state.renderSVG && !state.renderDefault && (
        <Image
          source={source}
          style={[styles.common, {width: size, height: size, borderRadius: size}]}
          onError={(event: NativeSyntheticEvent<ImageErrorEventData>) => {
            const error = event?.nativeEvent?.error;
            if (error) {
              const isDecodeError: boolean =
                typeof error === 'string' && errors.some(s => error.toLowerCase().indexOf(s) !== -1);
              setState({
                renderSVG: isDecodeError,
                renderDefault: !isDecodeError,
              });
            }
          }}
        />
      )}
    </View>
  );
};

export default React.memo(Avatar);
