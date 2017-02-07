/* @flow */
import {View, Image, Text, StyleSheet} from 'react-native';
import React from 'react';
import {UNIT} from '../variables/variables';
import ColorField from '../color-field/color-field';
import ApiHelper from '../api/api__helper';

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'column',
    padding: UNIT
  },
  issueIdColorField: {
    width: null, //Removes fixed width of usual color field
  },
  assignees: {
    flexDirection: 'row'
  },
  avatar: {
    marginTop: UNIT / 2,
    width: 40,
    height: 40,
    borderRadius: 20
  }
});

type Props = {
  issue: any
};


export default function AgileCard(props: Props) {
  const { issue } = props;
  const fieldHash = ApiHelper.makeFieldHash(issue);

  const issueId = fieldHash.Priority
    ? <ColorField
        fullText
        style={styles.issueIdColorField}
        text={ApiHelper.getIssueId(issue)}
        color={fieldHash.Priority.color}
      />
    : <Text>{ApiHelper.getIssueId(issue)}</Text>;

  const assignees = [fieldHash.Assignee, ...(fieldHash.Assignees || [])].filter(item => item);

  return (
    <View style={styles.card}>
      {issueId}
      <Text numberOfLines={3}>{issue.summary}</Text>
      <View style={styles.assignees}>
        {assignees.map(assignee => {
          return <Image key={assignee.id} style={styles.avatar} source={{ uri: assignee.avatarUrl }} />;
        })}
      </View>
    </View>
  );
}
