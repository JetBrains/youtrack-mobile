/* @flow */
import {TextInput, Platform} from 'react-native';
import React from 'react';

const INITIAL_INPUT_HEIGHT = Platform.OS === 'ios' ? 34 : 40;
const MAX_DEFAULT_HEIGHT = 200;
const DEFAULT_FONT_SIZE = 16;
const HEIGHT_SHIFT = 9;

type Props = {
  value: string,
  maxInputHeight: number,
  style: any
};

type State = {
  inputHeight: number
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
      inputHeight: INITIAL_INPUT_HEIGHT
    };
  }

  componentWillReceiveProps(newProps: Props) {
    if ('value' in newProps && !newProps.value) {
      this.setState({inputHeight: INITIAL_INPUT_HEIGHT});
    }
  }

  focus() {
    this.input.focus();
  }

  onSizeChange(e: Object) {
    const {maxInputHeight} = this.props;

    let newHeight = e.nativeEvent.contentSize.height + HEIGHT_SHIFT;

    if (maxInputHeight > 0) {
      newHeight = newHeight > maxInputHeight ? maxInputHeight : newHeight;
    }

    this.setState({inputHeight: newHeight});
  }

  render() {
    const {style, ...rest} = this.props;

    return <TextInput {...rest}
                      ref={instance => this.input = instance}
                      multiline={true}
                      onChange={(e) => this.onSizeChange(e)}
                      onContentSizeChange={(e) => this.onSizeChange(e)}
                      style={[{fontSize: DEFAULT_FONT_SIZE}, style, {height: this.state.inputHeight}]}/>;
  }
}
