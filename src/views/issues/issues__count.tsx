import React from 'react';
import {Text, View} from 'react-native';

import {View as AnimatedView} from 'react-native-animatable';

import styles from './issues.styles';

import {i18nPlural} from 'components/i18n/i18n';
import {Skeleton} from 'components/skeleton/skeleton';


const IssuesCount = ({issuesCount, isHelpdesk}: { issuesCount: number | null, isHelpdesk: boolean }) => {
  return typeof issuesCount === 'number' ? (
    <AnimatedView
      testID="test:id/issuesCount"
      accessible={true}
      useNativeDriver
      duration={500}
      animation="fadeIn"
      style={styles.toolbarAction}
    >
      <Text numberOfLines={2} style={styles.toolbarText}>
        {isHelpdesk
          ? i18nPlural(issuesCount, 'Matches {{issuesCount}} ticket', 'Matches {{issuesCount}} tickets', {
              issuesCount,
            })
          : i18nPlural(issuesCount, 'Matches {{issuesCount}} issue', 'Matches {{issuesCount}} issues', {
              issuesCount,
            })}
      </Text>
    </AnimatedView>
  ) : (
    <View style={styles.toolbarAction}>
      <Skeleton width={40} height={17} speed={2000} shimmerWidth={100} />
      <Text style={styles.toolbarText}>{' '}</Text>
    </View>
  );
};


export default IssuesCount;
