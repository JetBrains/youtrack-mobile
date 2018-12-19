/* @flow */
import {View, Text, StyleSheet} from 'react-native';
import React, {PureComponent} from 'react';
import {UNIT, COLOR_FONT, COLOR_PINK, COLOR_FONT_GRAY} from '../variables/variables';
import ColorField from '../color-field/color-field';
import Avatar from '../avatar/avatar';
import ApiHelper from '../api/api__helper';
import type {IssueOnList} from '../../flow/Issue';
import type {FieldValueShort, CustomFieldShort} from '../../flow/CustomFields';
import {getPriotityField, getAssigneeField} from '../issue-formatter/issue-formatter';

export const AGILE_CARD_HEIGHT = 131;

type Props = {
  style?: any,
  issue: IssueOnList,
  estimationField: ?{id: string},
  ghost?: boolean, // from <Draggable/>
  dragging?: boolean // from <DragContainer/>
};

function getEstimation(estimationField: {id: string}, fields: Array<CustomFieldShort>) {
  const field = fields.filter(field => field.projectCustomField.field.id === estimationField.id)[0];
  return field?.value?.presentation || 'Not estimated';
}

export default class AgileCard extends PureComponent<Props, void> {
  render() {
    const { issue, style, ghost, dragging, estimationField } = this.props;
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
        </View>
        <Text numberOfLines={3} style={styles.summary} testID="card-summary">
          {issue.summary}
        </Text>
        <View style={styles.assignees}>
          {assignees.map((assignee: FieldValueShort) => {
            return (
              <Avatar
                key={assignee.id}
                size={40}
                userName={assignee.name}
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
    height: AGILE_CARD_HEIGHT,
    backgroundColor: '#FFF'
  },
  ghost: {
    display: 'none'
  },
  dragging: {
    transform: [{rotate: '-5deg'}],
    width: '50%',
    borderRadius: 6,
    borderColor: `${COLOR_PINK}70`,
    borderWidth: 4
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  estimation: {
    flexShrink: 1,
    marginLeft: UNIT * 2,
    fontSize: 11,
    color: COLOR_FONT_GRAY
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
  }
});
