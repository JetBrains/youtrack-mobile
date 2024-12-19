import React, {PureComponent} from 'react';
import {Text} from 'react-native';

import styles from './text-view.styles';

import type {ViewStyleProp} from 'types/Internal';

interface Props {
  maxLength?: number;
  text: string;
  style?: ViewStyleProp;
}

export const showMoreText = 'Show\xa0more…';
export const showMoreInlineText = `  ${showMoreText}  `;
export const MAX_TO_SHOW: number = 500;
export const DEFAULT_MAX_LENGTH: number = 50;
export const THRESHOLD: number = 5;

export default class TextView extends PureComponent<Props, {showMore: boolean}> {
  constructor(props: Props) {
    super(props);
    const maxLength = props.maxLength || DEFAULT_MAX_LENGTH;
    const textLength = props.text.length;
    this.state = {
      showMore: textLength > maxLength + THRESHOLD,
    };
  }

  _toggleShowMore() {
    this.setState({
      showMore: !this.state.showMore,
    });
  }

  _getText() {
    const {text, maxLength = DEFAULT_MAX_LENGTH} = this.props;
    const length = Math.min(maxLength, MAX_TO_SHOW);

    if (this.state.showMore && text.length) {
      return text.substr(0, length);
    }

    return text.substr(0, MAX_TO_SHOW);
  }

  render(): React.ReactNode {
    return (
      <Text testID="textMoreContent">
        <Text style={this.props.style}>{`${this._getText()}...`}</Text>
        {this.state.showMore && (
          <Text testID="textMoreShowMore" style={{color: styles.link.color}} onPress={() => this._toggleShowMore()}>
            {showMoreInlineText}
          </Text>
        )}
      </Text>
    );
  }
}
