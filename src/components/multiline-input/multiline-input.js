/* @flow */
import {TextInput} from 'react-native';
import React from 'react';

const INITIAL_INPUT_HEIGHT = 36;
const MAX_INPUT_HEIGHT = 200;
const DEFAULT_FONT_SIZE = 16;
const HEIGHT_SHIFT = 9;

type Props = {
  value: string,
  style: any
};

type State = {
  inputHeight: number
};

export default class MultilineInput extends React.Component {
  props: Props;
  state: State;

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

  onSizeChange(e: Object) {
    let newHeight = e.nativeEvent.contentSize.height + HEIGHT_SHIFT;
    newHeight = newHeight > MAX_INPUT_HEIGHT ? MAX_INPUT_HEIGHT : newHeight;
    this.setState({inputHeight: newHeight});
  }

  render() {
    const {style, ...other} = this.props;

    return <TextInput {...other}
                      multiline={true}
                      onContentSizeChange={(e) => this.onSizeChange(e)}
                      style={[{fontSize: DEFAULT_FONT_SIZE}, style, {height: this.state.inputHeight}]}/>;
  }
}
