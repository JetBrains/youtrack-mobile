// @flow

import React, {PureComponent} from 'react';
import {StyleSheet, Text} from 'react-native';

import {COLOR_LINK} from '../variables/variables';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


type Props = {
  maxLength?: number,
  text: string,
  style?: ViewStyleProp
}

type State = {
  showMore: boolean
}

export const showMoreText = `Show\xa0more…`;
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
      showMore: textLength > maxLength + this.THRESHOLD
    };
  }


  _toggleShowMore() {
    this.setState({showMore: !this.state.showMore});
  }

  _getText() {
    const {text, maxLength = this.DEFAULT_MAX_LENGTH} = this.props;
    const length = Math.min(maxLength, this.MAX_TO_SHOW);

    if (this.state.showMore && text.length) {
      return text.substr(0, length);
    }
    return text.substr(0, this.MAX_TO_SHOW);
  }

  render() {
    return (
      <Text testID='textMoreContent'>
        <Text style={this.props.style}>{`${this._getText()}...`}</Text>
        {this.state.showMore && <Text
          testID='textMoreShowMore'
          style={styles.more}
          onPress={() => this._toggleShowMore()}>
          {showMoreInlineText}
        </Text>}
      </Text>
    );
  }
}


const styles = StyleSheet.create({
  more: {
    color: COLOR_LINK
  }
});
