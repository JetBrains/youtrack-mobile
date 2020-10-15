/* @flow */

import React, {PureComponent} from 'react';
import {TextInput} from 'react-native';
import {UNIT} from '../variables/variables';
import {isIOSPlatform} from '../../util/util';

const MAX_DEFAULT_HEIGHT = 200;
const MIN_DEFAULT_HEIGHT = UNIT * 4;
const DEFAULT_FONT_SIZE = 16;

type Props = {
  maxInputHeight: number,
  minInputHeight: number,
  autoFocus?: boolean,
  style: any
};

type State = {
  inputHeight: ?number
};

export default class MultilineInput extends PureComponent<Props, State> {
  static defaultProps = {
    maxInputHeight: MAX_DEFAULT_HEIGHT,
    minInputHeight: MIN_DEFAULT_HEIGHT,
    returnKeyType: isIOSPlatform() ? 'default' : 'none'
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
    const {maxInputHeight, minInputHeight} = this.props;

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
    // eslint-disable-next-line no-unused-vars
    const {style, maxInputHeight, minInputHeight, ...rest} = this.props;

    return (
      <TextInput
        {...rest}
        ref={this.inputRef}
        multiline={true}
        onContentSizeChange={this.onContentSizeChange}
        style={[
          {fontSize: DEFAULT_FONT_SIZE},
          style,
          {height: this.state.inputHeight}
        ]}
      />
    );
  }
}
