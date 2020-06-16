/* @flow */

import {View, Text} from 'react-native';
import React, {PureComponent} from 'react';
import Avatar from '../avatar/avatar';
import ApiHelper from '../api/api__helper';
import {getPriotityField, getAssigneeField} from '../issue-formatter/issue-formatter';
import Tags from '../tags/tags';
import {INITIAL_COLOR} from '../color-field/color-field';

import styles from './agile-card.styles';

import type {IssueOnList} from '../../flow/Issue';
import type {FieldValueShort, CustomFieldShort} from '../../flow/CustomFields';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import {getStorageState} from '../storage/storage';

type Props = {
  style?: any,
  issue: IssueOnList,
  estimationField: ?{ id: string },
  zoomedIn?: boolean,
  ghost?: boolean, // from <Draggable/>
  dragging?: boolean // from <DragContainer/>
};


export const getAgileCardHeight = () => (getStorageState().agileZoomedIn ?? true) ? 110 : 50;

function getEstimation(estimationField: { id: string }, fields: Array<CustomFieldShort>) {
  const field = fields.filter(field => field.projectCustomField.field.id === estimationField.id)[0];
  return field?.value?.presentation || '';
}

export default class AgileCard extends PureComponent<Props, void> {
  render() {
    const {issue, style, ghost, dragging, estimationField, zoomedIn} = this.props;
    const priorityField = getPriotityField(issue);
    const priorityFieldValueBackgroundColor = priorityField?.value?.color?.background || INITIAL_COLOR;

    const assigneeField = getAssigneeField(issue);
    const assignees = []
      .concat(assigneeField ? assigneeField.value : null)
      .filter(item => item);

    const zoomedInTextStyle: ?ViewStyleProp = zoomedIn ? null : styles.zoomedInText;

    return (
      <View style={[
        styles.card,
        style,
        ghost && styles.ghost,
        dragging && ([styles.dragging, !zoomedIn && styles.draggingZoomedOut]),
        {height: getAgileCardHeight()},
      ]}>
        <View style={[
          styles.cardColorCoding,
          priorityField ? {backgroundColor: priorityFieldValueBackgroundColor} : null,
        ]}/>

        <View style={[
          styles.cardContainer,
          zoomedIn ? null : styles.cardContainerNotZoomed
        ]}>
          <View style={styles.issueHeader}>
            <View style={styles.issueHeaderLeft}>
              <Text
                style={[
                  styles.issueId,
                  zoomedInTextStyle
                ]}
                testID="card-simple-issue-id"
              >
                {ApiHelper.getIssueId(issue)}
              </Text>
            </View>

            {zoomedIn && <View style={styles.assignees}>
              {!!estimationField && zoomedIn && (
                <Text style={styles.estimation} numberOfLines={1}>
                  {getEstimation(estimationField, issue.fields)}
                </Text>
              )}

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
            </View>}

          </View>

          <View style={styles.issueContent}>
            <Text
              style={styles.issueSummary}
              numberOfLines={zoomedIn ? 2 : 1}
            >
              <Text
                testID="card-summary"
                style={[styles.summary, zoomedInTextStyle]}
              >
                {issue.summary}
              </Text>
            </Text>

            {zoomedIn && <Tags tags={issue.tags} style={styles.tags} multiline={true}/>}
          </View>

        </View>
      </View>
    );
  }
}
