import React from 'react';
import {View} from 'react-native';
import {SkeletonIssues} from 'components/skeleton/skeleton';
import {UNIT} from 'components/variables';

export default () => (
  <View
    testID="test:id/inboxThreadsProgress"
    accessibilityLabel="inboxThreadsProgress"
    accessible={true}
  >
    <SkeletonIssues marginTop={UNIT * 1.5} />
  </View>
);
