/* @flow */
import {Image} from 'react-native';
import React, {Component} from 'react';
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

export default class Avatar extends Component<Props, State> {
  state = {
    renderDefault: false
  }

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
      borderRadius: size / 2
    };

    return (
      <Image source={source} style={[imageStyle, style]} onError={this.handleImageLoadError} />
    );
  }
}
