/* @flow */
import {TextInput} from 'react-native';
import React from 'react';

const MAX_DEFAULT_HEIGHT = 200;
const DEFAULT_FONT_SIZE = 16;

type Props = {
  value: string,
  maxInputHeight: number,
  style: any
};

type State = {
  inputHeight: ?number
};

export default class MultilineInput extends React.Component {
  props: Props;
  state: State;
  input: TextInput;

  static defaultProps = {
    maxInputHeight: MAX_DEFAULT_HEIGHT
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

  onChange = (e: Object) => {
    const {maxInputHeight} = this.props;

    let newHeight = e.nativeEvent.contentSize.height;

    if (maxInputHeight > 0) {
      newHeight = newHeight > maxInputHeight ? maxInputHeight : newHeight;
    }

    this.setState({inputHeight: newHeight});
  }

  onContentSizeChange = (event: Object) => {
    const DIFF_SHIFT = 4;

    if (this.state.inputHeight === null) {
      this.setState({
        inputHeight: event.nativeEvent.contentSize.height + DIFF_SHIFT
      });
    }
  }

  render() {
    const {style, ...rest} = this.props;

    return (
      <TextInput
        {...rest}
        ref={instance => this.input = instance}
        multiline={true}
        onChange={this.onChange}
        onContentSizeChange={this.onContentSizeChange}
        style={[{fontSize: DEFAULT_FONT_SIZE}, style, {height: this.state.inputHeight}]}
      />
    );
  }
}
