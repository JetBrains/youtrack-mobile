/* @flow */

import {Text} from 'react-native';
import React, {PureComponent} from 'react';

import {View as AnimatedView} from 'react-native-animatable';
import {UNIT} from '../../components/variables/variables';
import {secondaryText} from '../../components/common-styles/typography';
import type {UITheme} from '../../flow/Theme';

const styles = (uiTheme: UITheme) => ({
  issuesCount: {
    marginTop: UNIT * 2,
    marginBottom: UNIT * 2,
    marginLeft: UNIT * 2,
    ...secondaryText,
    color: uiTheme.colors.$icon
  }
});


type Props = {
  issuesCount: ?number,
  uiTheme: UITheme
};


export default class IssuesCount extends PureComponent<Props, void> {

  render() {
    const {issuesCount, uiTheme} = this.props;

    if (!issuesCount) {
      return null;
    }

    const text = `Matches ${issuesCount} issue${issuesCount >= 0 ? 's' : ''}`;

    return (
      <AnimatedView
        useNativeDriver
        duration={500}
        animation="fadeIn">
        <Text style={styles(uiTheme).issuesCount}>
          {text}
        </Text>
      </AnimatedView>
    );
  }
}
