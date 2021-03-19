/* @flow */

import React, {PureComponent} from 'react';
import {TextInput} from 'react-native';

import {isIOSPlatform} from '../../util/util';
import {UNIT} from '../variables/variables';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

const iOSPlatform: boolean = isIOSPlatform();
const MAX_DEFAULT_HEIGHT = 200;
const MIN_DEFAULT_HEIGHT = UNIT * 4;
const DEFAULT_FONT_SIZE = 16;

type Props = {
  adaptive?: boolean,
  maxInputHeight: number,
  minInputHeight: number,
  autoFocus?: boolean,
  style?: ViewStyleProp
};

type State = {
  inputHeight: ?number
};

export default class MultilineInput extends PureComponent<Props, State> {
  static defaultProps = {
    adaptive: true,
    maxInputHeight: MAX_DEFAULT_HEIGHT,
    minInputHeight: MIN_DEFAULT_HEIGHT,
    returnKeyType: iOSPlatform ? 'default' : 'none',
  };

  input: TextInput;

  constructor(props: Props) {
    super(props);
    this.state = {
      inputHeight: null,
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.autoFocus && this.props.autoFocus === true) {
      this.focus();
    }
  }

  focus() {
    this.input && this.input.focus();
  }

  onContentSizeChange = (event: Object) => {
    const {maxInputHeight, minInputHeight, adaptive} = this.props;
    if (!adaptive) {
      return;
    }

    let newHeight = event.nativeEvent.contentSize.height + UNIT;

    if (maxInputHeight > 0) {
      newHeight = newHeight > maxInputHeight ? maxInputHeight : Math.max(newHeight, minInputHeight);
    }

    this.setState({inputHeight: Math.ceil(newHeight)});
  };

  inputRef = (instance: ?TextInput) => {
    if (instance) {
      this.input = instance;
    }
  };

  render() {
    const {style, maxInputHeight, minInputHeight, adaptive, ...rest} = this.props;

    return (
      <TextInput
        {...rest}
        ref={this.inputRef}
        multiline={true}
        onContentSizeChange={this.onContentSizeChange}
        style={[
          {fontSize: DEFAULT_FONT_SIZE},
          style,
          adaptive ? {height: this.state.inputHeight} : null,
        ]}
      />
    );
  }
}
