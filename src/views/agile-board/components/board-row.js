/* @flow */
import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {COLOR_GRAY} from '../../../components/variables/variables';
import AgileCard from '../../../components/agile-card/agile-card';

const COL_WIDTH = 200;

const styles = StyleSheet.create({
  rowContainer: {

  },
  rowHeader: {

  },
  row: {
    flexDirection: 'row'
  },
  column: {
    width: COL_WIDTH,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: COLOR_GRAY
  }
});

type Props = {
  row: any
};

export default function BoardRow(props: Props) {
  const fakeIssue = {
    numberInProject: 123,
    summary: 'Do something interesting',
    project: {
      shortName: 'YTM'
    },
    reporter: {
      fullName: 'Blah Blah'
    }
  };
  return (
    <View style={styles.rowContainer}>
      <View style={styles.rowHeader}>
        <Text>Row issue summary</Text>
      </View>
      <View style={styles.row}>
        <View style={styles.column}>
          <AgileCard issue={fakeIssue}/>
          <AgileCard issue={fakeIssue}/>
        </View>
        <View style={styles.column}>
          <AgileCard issue={fakeIssue}/>
        </View>
        <View style={styles.column}>
          <AgileCard issue={fakeIssue}/>
        </View>
      </View>
    </View>
  );
}
