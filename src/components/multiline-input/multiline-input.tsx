import React, {PureComponent} from 'react';
import {TextInput} from 'react-native';

import {isIOSPlatform} from 'util/util';
import {UNIT} from 'components/variables';

import type {ViewStyleProp} from 'types/Internal';

const iOSPlatform: boolean = isIOSPlatform();
const MAX_DEFAULT_HEIGHT = 200;
const MIN_DEFAULT_HEIGHT = UNIT * 4;
const DEFAULT_FONT_SIZE = 16;

type Props = {
  adaptive?: boolean;
  maxInputHeight?: number;
  autoFocus?: boolean;
  style?: ViewStyleProp | ViewStyleProp[];
};

type State = {
  inputHeight: number | null | undefined;
};

export default class MultilineInput extends PureComponent<Props, State> {
  input: TextInput | null = null;

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
    this.input?.focus?.();
  }

  onContentSizeChange: (event: any) => void = (event: Record<string, any>) => {
    const {maxInputHeight = MAX_DEFAULT_HEIGHT, adaptive = true} = this.props;

    if (!adaptive) {
      return;
    }

    let newHeight = event.nativeEvent.contentSize.height + UNIT;

    if (maxInputHeight > 0) {
      newHeight =
        newHeight > maxInputHeight
          ? maxInputHeight
          : Math.max(newHeight, MIN_DEFAULT_HEIGHT);
    }

    this.setState({
      inputHeight: Math.ceil(newHeight),
    });
  };
  inputRef = (instance: TextInput | null) => {
    if (instance) {
      this.input = instance;
    }
  };

  render() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {style, adaptive = true, maxInputHeight, ...rest} = this.props;
    return (
      <TextInput
        {...rest}
        returnKeyType={iOSPlatform ? 'default' : 'none'}
        ref={this.inputRef}
        testID="test:id/multiline-input"
        accessibilityLabel="multiline-input"
        accessible={true}
        multiline={true}
        onContentSizeChange={this.onContentSizeChange}
        style={[
          {
            fontSize: DEFAULT_FONT_SIZE,
          },
          style,
          adaptive
            ? {
                height: this.state.inputHeight,
              }
            : null,
        ]}
      />
    );
  }
}
