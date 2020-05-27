/* @flow */

import {Text} from 'react-native';
import React, {PureComponent} from 'react';

import {View as AnimatedView} from 'react-native-animatable';

import styles from './issue-list__count.styles';

type Props = {
  issuesCount?: ?number
};


export default class IssuesCount extends PureComponent<Props, void> {

  render() {
    const {issuesCount} = this.props;
    const text = (
      !issuesCount
        ? ' '
        : `Matches ${issuesCount} issue${issuesCount >= 0 ? 's' : ''}`
    );

    return (
      <AnimatedView
        useNativeDriver
        duration={500}
        animation="fadeIn">
        <Text style={styles.issuesCount}>
          {text}
        </Text>
      </AnimatedView>
    );
  }
}
