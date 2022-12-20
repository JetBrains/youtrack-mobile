import type {Node} from 'react';
import React, {PureComponent} from 'react';
import {Text} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
type Props = {
  maxLength?: number;
  text: string;
  style?: ViewStyleProp;
};
type State = {
  showMore: boolean;
};
export const showMoreText = 'Show\xa0more…';
export const showMoreInlineText = `  ${showMoreText}  `;
export default class TextView extends PureComponent<Props, State> {
  MAX_TO_SHOW: number = 500;
  DEFAULT_MAX_LENGTH: number = 50;
  THRESHOLD: number = 5;

  constructor(props: Props) {
    super(props);
    const maxLength = props.maxLength || this.DEFAULT_MAX_LENGTH;
    const textLength = props.text.length;
    this.state = {
      showMore: textLength > maxLength + this.THRESHOLD,
    };
  }

  _toggleShowMore() {
    this.setState({
      showMore: !this.state.showMore,
    });
  }

  _getText() {
    const {text, maxLength = this.DEFAULT_MAX_LENGTH} = this.props;
    const length = Math.min(maxLength, this.MAX_TO_SHOW);

    if (this.state.showMore && text.length) {
      return text.substr(0, length);
    }

    return text.substr(0, this.MAX_TO_SHOW);
  }

  render(): Node {
    return (
      <Text testID="textMoreContent">
        <Text style={this.props.style}>{`${this._getText()}...`}</Text>
        {this.state.showMore && (
          <Text
            testID="textMoreShowMore"
            style={{
              color: EStyleSheet.value('$link'),
            }}
            onPress={() => this._toggleShowMore()}
          >
            {showMoreInlineText}
          </Text>
        )}
      </Text>
    );
  }
}