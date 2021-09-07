/* @flow */

import React from 'react';
import {Text} from 'react-native';

import {View as AnimatedView} from 'react-native-animatable';

import styles from './issues.styles';

type Props = {
  issuesCount: ?number
};


const IssuesCount = (props: Props) => {
  const {issuesCount} = props;
  const text = issuesCount && (
    issuesCount >= 0
      ? `Matches ${issuesCount} issues`
      : `Matches ${issuesCount} issue`
  ) || '';

  return (
    <AnimatedView
      testID= "test:id/issues-count"
      useNativeDriver
      duration={500}
      animation="fadeIn">
      <Text style={styles.issuesCount}>
        {text}
      </Text>
    </AnimatedView>
  );
};

export default (React.memo<Props>(IssuesCount): React$AbstractComponent<Props, mixed>);
