/* @flow */
import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {UNIT} from '../variables/variables';


const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'column',
    padding: UNIT
  }
});

type Props = {
  issue: any
};

export default function AgileCard(props: Props) {
  const {issue} = props;

  return (
    <View style={styles.card}>
      <Text>{issue.project.shortName}-{issue.numberInProject}</Text>
      <Text numberOfLines={3}>{issue.summary}</Text>
      <Text>by {issue.reporter.fullName || issue.reporter.login}</Text>
    </View>
  );
}
