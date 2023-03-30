import React from 'react';
import {Image} from 'react-native';

import DefaultAvatar from './default-avatar';

import styles from './default-avatar.styles';

interface Props {
  userName: string;
  size: number;
  source: {
    uri: string;
  };
  style?: Record<string, any>;
}

interface State {
  renderDefault: boolean;
}


export default class Avatar extends React.PureComponent<Props, State> {
  state: State = {
    renderDefault: false,
  };
  handleImageLoadError: () => void = () => {
    this.setState({
      renderDefault: true,
    });
  };

  render(): React.ReactNode {
    const {source, userName = 'A', size, style} = this.props;
    const {renderDefault} = this.state;

    if (renderDefault) {
      return (
        <DefaultAvatar
          size={size}
          text={userName}
          style={[styles.common, style]}
        />
      );
    }

    const imageSize = {
      width: size,
      height: size,
    };
    return (
      <Image
        source={source}
        style={[styles.common, imageSize, style]}
        onError={this.handleImageLoadError}
      />
    );
  }
}
