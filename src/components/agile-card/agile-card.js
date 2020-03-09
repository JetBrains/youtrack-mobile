/* @flow */

import {View, Text} from 'react-native';
import React, {PureComponent} from 'react';
import ColorField from '../color-field/color-field';
import Avatar from '../avatar/avatar';
import ApiHelper from '../api/api__helper';
import {getPriotityField, getAssigneeField} from '../issue-formatter/issue-formatter';
import Tags from '../tags/tags';
import styles from './agile-card.styles';

import type {IssueOnList} from '../../flow/Issue';
import type {FieldValueShort, CustomFieldShort} from '../../flow/CustomFields';

type Props = {
  style?: any,
  issue: IssueOnList,
  estimationField: ?{ id: string },
  ghost?: boolean, // from <Draggable/>
  dragging?: boolean // from <DragContainer/>
};
export const AGILE_CARD_HEIGHT = 131;

function getEstimation(estimationField: { id: string }, fields: Array<CustomFieldShort>) {
  const field = fields.filter(field => field.projectCustomField.field.id === estimationField.id)[0];
  return field?.value?.presentation || 'Not estimated';
}

export default class AgileCard extends PureComponent<Props, void> {
  render() {
    const {issue, style, ghost, dragging, estimationField} = this.props;
    const priorityField = getPriotityField(issue);

    const priorityFieldValue = priorityField?.value;
    const priorityFieldValueColor = priorityField?.value?.color;

    const issueId = (priorityFieldValue)
      ? <View style={styles.colorFieldContainer}>
        <ColorField
          fullText
          style={styles.issueIdColorField}
          text={ApiHelper.getIssueId(issue)}
          color={priorityFieldValueColor}
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
      <View style={[
        styles.card,
        style,
        ghost && styles.ghost,
        dragging && styles.dragging
      ]}>
        <View style={styles.topLine}>
          {issueId}

          {estimationField && (
            <Text style={styles.estimation} numberOfLines={1}>
              {getEstimation(estimationField, issue.fields)}
            </Text>
          )}

          <View style={styles.assignees}>
            {assignees.map((assignee: FieldValueShort) => {
              return (
                <Avatar
                  style={styles.assignee}
                  key={assignee.id}
                  size={20}
                  userName={assignee.name}
                  source={{uri: assignee.avatarUrl}}
                  testID="card-avatar"
                />
              );
            })}
          </View>
        </View>

        <Text
          testID="card-summary"
          numberOfLines={3}
          style={styles.summary}
        >
          {issue.summary}
        </Text>

        <Tags style={styles.tags} tags={issue.tags}/>
      </View>
    );
  }
}
