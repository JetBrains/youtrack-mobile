import React from 'react';
import {Image, ImageErrorEventData, NativeSyntheticEvent} from 'react-native';

import {SvgUri} from 'react-native-svg';

import DefaultAvatar from './default-avatar';

import styles from './default-avatar.styles';

interface Props {
  userName?: string;
  size: number;
  source: {
    uri: string;
  };
  style?: Record<string, any>;
}

interface State {
  renderDefault: boolean;
  renderSVG: boolean;
}


const Avatar = (props: Props) => {
  const {source, userName = 'A', size, style} = props;

  const [state, setState] = React.useState<State>({
    renderDefault: false,
    renderSVG: false,
  });


  if (state.renderSVG) {
    return (
      <SvgUri
        width={size}
        height={size}
        uri={source.uri}
        onError={() => setState({
          renderSVG: false,
          renderDefault: true,
        })}
      />
    );
  } else if (state.renderDefault) {
    return (
      <DefaultAvatar
        size={size}
        text={userName}
        style={[styles.common, style]}
      />
    );
  }

  return (
    <Image
      source={source}
      style={[
        styles.common,
        {width: size, height: size},
        style,
      ]}
      onError={(e: NativeSyntheticEvent<ImageErrorEventData>) => {
        const error: unknown | undefined = e?.nativeEvent?.error;
        if (error) {
          const isDecodeError: boolean = typeof error === 'string' && error.indexOf('Error decoding image data') !== -1;
          setState({
            renderSVG: isDecodeError,
            renderDefault: !isDecodeError,
          });
        }
      }}
    />
  );
};


export default React.memo(Avatar);
