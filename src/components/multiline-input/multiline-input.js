/* @flow */
import {TextInput, Platform} from 'react-native';
import React, {Component} from 'react';

const MAX_DEFAULT_HEIGHT = 200;
const DEFAULT_FONT_SIZE = 16;
const SPARE_SPACE = 16;

type Props = {
  maxInputHeight: number,
  style: any
};

type State = {
  inputHeight: ?number
};

export default class MultilineInput extends Component<Props, State> {
  input: TextInput;

  static defaultProps = {
    maxInputHeight: MAX_DEFAULT_HEIGHT,
    returnKeyType: Platform.OS === 'ios' ? 'default' : 'none'
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      inputHeight: null,
    };
  }

  focus() {
    this.input.focus();
  }

  onContentSizeChange = (event: Object) => {
    const {maxInputHeight} = this.props;

    let newHeight = event.nativeEvent.contentSize.height + SPARE_SPACE;

    if (maxInputHeight > 0) {
      newHeight = newHeight > maxInputHeight ? maxInputHeight : newHeight;
    }

    this.setState({inputHeight: newHeight});
  }

  inputRef = (instance: ?TextInput) => {
    if (instance) {
      this.input = instance;
    }
  };

  render() {
    // eslint-disable-next-line no-unused-vars
    const {style, maxInputHeight, ...rest} = this.props;

    return (
      <TextInput
        {...rest}
        ref={this.inputRef}
        multiline={true}
        onContentSizeChange={this.onContentSizeChange}
        style={[{fontSize: DEFAULT_FONT_SIZE}, style, {height: this.state.inputHeight}]}
      />
    );
  }
}
