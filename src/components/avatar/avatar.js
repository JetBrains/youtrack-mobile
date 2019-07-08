/* @flow */
import {Image} from 'react-native';
import React, {PureComponent} from 'react';
import DefaultAvatar from './default-avatar';

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

    const imageStyle = {
      width: size,
      height: size,
      borderRadius: 3
    };

    return (
      <Image source={source} style={[imageStyle, style]} onError={this.handleImageLoadError} />
    );
  }
}
