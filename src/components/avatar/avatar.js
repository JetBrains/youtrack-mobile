/* @flow */
import {Image} from 'react-native';
import React, {PureComponent} from 'react';
import DefaultAvatar from './default-avatar';
import styles from './default-avatar.styles';

type Props = {
  userName: string,
  size: number,
  source: {uri: string},
  style?: ?Object
};

type State = {
  renderDefault: boolean
}

export default class Avatar extends PureComponent<Props, State> {
  state = {
    renderDefault: false
  };

  handleImageLoadError = () => {
    this.setState({renderDefault: true});
  };

  render() {
    const {source, userName, size, style} = this.props;
    const {renderDefault} = this.state;

    if (renderDefault) {
      return (
        <DefaultAvatar size={size} text={userName} style={style}/>
      );
    }

    const imageSize = {
      width: size,
      height: size
    };

    return (
      <Image source={source} style={[styles.common, imageSize, style]} onError={this.handleImageLoadError} />
    );
  }
}
