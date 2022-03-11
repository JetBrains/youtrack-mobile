/* @flow */

import React from 'react';
import {Text} from 'react-native';

import {View as AnimatedView} from 'react-native-animatable';

import styles from './issues.styles';
import {i18nPlural} from 'components/i18n/i18n';

type Props = {
  issuesCount: ?number
};


const IssuesCount = (props: Props) => {
  const {issuesCount} = props;
  const text: string = (
    issuesCount
      ? i18nPlural(
        issuesCount,
        `Matches ${issuesCount} issue`,
        `Matches ${issuesCount} issues`,
        {issuesCount}
      )
      : ''
  );

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
