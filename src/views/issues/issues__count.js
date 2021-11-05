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
      testID= "test:id/issuesCount"
      accessibilityLabel= "issuesCount"
      accessible={true}
      useNativeDriver
      duration={500}
      animation="fadeIn"
      style={styles.toolbarAction}
    >
      <Text
        numberOfLines={1}
        style={styles.toolbarText}>
        {text}
      </Text>
    </AnimatedView>
  );
};

export default (React.memo<Props>(IssuesCount): React$AbstractComponent<Props, mixed>);
