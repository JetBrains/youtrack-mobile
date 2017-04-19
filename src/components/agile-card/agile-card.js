/* @flow */
import {View, Image, Text, StyleSheet} from 'react-native';
import React, {PureComponent} from 'react';
import {UNIT, COLOR_FONT} from '../variables/variables';
import ColorField from '../color-field/color-field';
import ApiHelper from '../api/api__helper';
import type {IssueOnList} from '../../flow/Issue';
import type {CustomFieldValue} from '../../flow/CustomFields';
import {getPriotityField, getAssigneeField} from '../issue-formatter/issue-formatter';

type Props = {
  style?: any,
  issue: IssueOnList
};

export default class AgileCard extends PureComponent<void, Props, void> {
  render() {
    const { issue, style } = this.props;
    const priorityField = getPriotityField(issue);

    const issueId = priorityField
      ? <View style={styles.colorFieldContainer}>
          <ColorField
            fullText
            style={styles.issueIdColorField}
            text={ApiHelper.getIssueId(issue)}
            color={priorityField.value.color}
          />
        </View>
      : <Text testID="card-simple-issue-id">
          {ApiHelper.getIssueId(issue)}
        </Text>;

    const assigneeField = getAssigneeField(issue);
    const assignees = []
      .concat(assigneeField ? assigneeField.value : null)
      .filter(item => item);

    return (
      <View style={[styles.card, style]}>
        {issueId}
        <Text numberOfLines={3} style={styles.summary} testID="card-summary">
          {issue.summary}
        </Text>
        <View style={styles.assignees}>
          {assignees.map((assignee: CustomFieldValue) => {
            return (
              <Image
                key={assignee.id}
                style={styles.avatar}
                source={{ uri: assignee.avatarUrl }}
                testID="card-avatar"
              />
            );
          })}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    padding: UNIT,
    height: 131
  },
  summary: {
    color: COLOR_FONT,
    fontSize: 13,
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
