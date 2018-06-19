/* @flow */
import {Image} from 'react-native';
import React, {Component} from 'react';
import DefaultAvatar from './default-avatar';

const defaultsCache = new Map();

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

  componentDidMount() {
    this.checkIfImageIsSVG();
  }

  async checkIfImageIsSVG() {
    const {uri} = this.props.source;
    if (defaultsCache.has(uri)) {
      this.setState({renderDefault: defaultsCache.get(uri)});
      return;
    }

    const response = await fetch(this.props.source.uri);

    if (response.headers.get('Content-Type') === 'image/svg+xml') {
      this.setState({renderDefault: true});
      defaultsCache.set(uri, true);
      return;
    }
    defaultsCache.set(uri, false);
  }

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
      <Image source={source} style={[imageStyle, style]} />
    );
  }
}
