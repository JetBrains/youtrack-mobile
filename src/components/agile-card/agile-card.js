/* @flow */
import {View, Image, Text, StyleSheet} from 'react-native';
import React from 'react';
import {UNIT} from '../variables/variables';
import ColorField from '../color-field/color-field';
import ApiHelper from '../api/api__helper';

type Props = {
  style?: any,
  issue: IssueOnList
};

export default function AgileCard(props: Props) {
  const { issue, style } = props;
  const fieldHash = ApiHelper.makeFieldHash(issue);

  const issueId = fieldHash.Priority
    ? <View style={styles.colorFieldContainer}>
      <ColorField
        fullText
        style={styles.issueIdColorField}
        text={ApiHelper.getIssueId(issue)}
        color={fieldHash.Priority.color}
      />
    </View>
    : <Text testID="card-simple-issue-id">{ApiHelper.getIssueId(issue)}</Text>;

  const assignees = [fieldHash.Assignee, ...(fieldHash.Assignees || [])].filter(item => item);

  return (
    <View style={[styles.card, style]}>
      {issueId}
      <Text numberOfLines={3} style={styles.summary} testID="card-summary">{issue.summary}</Text>
      <View style={styles.assignees}>
        {assignees.map(assignee => {
          return <Image key={assignee.id} style={styles.avatar} source={{ uri: assignee.avatarUrl }} testID="card-avatar"/>;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    padding: UNIT
  },
  summary: {
    fontSize: 13,
    height: 56,
    paddingTop: UNIT/2,
    paddingBottom: UNIT/2
  },
  colorFieldContainer: {
    flexDirection: 'row'
  },
  issueIdColorField: {
    paddingLeft: UNIT/2,
    paddingRight: UNIT/2,
    width: null, //Removes fixed width of usual color field
  },
  assignees: {
    flexDirection: 'row',
    height: 40
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  }
});
