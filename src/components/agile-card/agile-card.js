/* @flow */

import {View, Text} from 'react-native';
import React, {PureComponent} from 'react';
import Avatar from '../avatar/avatar';
import ApiHelper from '../api/api__helper';
import {getPriotityField, getAssigneeField} from '../issue-formatter/issue-formatter';
import Tags from '../tags/tags';
import {UNIT} from '../variables/variables';
import {getStorageState} from '../storage/storage';

import styles from './agile-card.styles';

import type {IssueOnList} from '../../flow/Issue';
import type {CustomFieldShort, CustomField, FieldValue} from '../../flow/CustomFields';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {UITheme} from '../../flow/Theme';

type Props = {
  style?: any,
  issue: IssueOnList,
  estimationField?: { id: string },
  zoomedIn?: boolean,
  ghost?: boolean, // from <Draggable/>
  dragging?: boolean, // from <DragContainer/>
  uiTheme: UITheme
};


const cardBottomMargin: number = UNIT * 1.5;
export const getAgileCardHeight = () => ((getStorageState().agileZoomedIn ?? true) ? 110 : 50) + cardBottomMargin;

function getEstimation(estimationField: { id: string }, fields: Array<CustomFieldShort> = []) {
  const field = fields.filter(field => field.projectCustomField.field.id === estimationField.id)[0];
  return field?.value?.presentation || '';
}

export default class AgileCard extends PureComponent<Props, void> {

  renderEstimation() {
    const {issue, estimationField, zoomedIn} = this.props;

    if (!!estimationField && zoomedIn) {
      return (
        <Text style={styles.estimation} numberOfLines={1}>
          {getEstimation(estimationField, issue.fields)}
        </Text>
      );
    }
  }

  renderAssignees(): Array<FieldValue> {
    const {issue} = this.props;
    const assigneeField: CustomField = getAssigneeField(issue);
    const assignees: Array<FieldValue> = [].concat(assigneeField ? assigneeField.value : null).filter(item => item);

    return assignees.map((assignee: FieldValue) => {
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
    });
  }

  render() {
    const {issue, style, ghost, dragging, zoomedIn} = this.props;
    const priorityField = getPriotityField(issue);
    const priorityFieldValueBackgroundColor = priorityField?.value?.color?.background;

    const zoomedInTextStyle: ?ViewStyleProp = zoomedIn ? null : styles.zoomedInText;
    const agileCardHeight: number = getAgileCardHeight();

    return (
      <View style={[
        ghost && styles.ghost,
        {height: agileCardHeight},
      ]}>

        <View style={[
          styles.card,
          style,
          dragging && ([styles.dragging, !zoomedIn && styles.draggingZoomedOut]),
          {height: agileCardHeight - cardBottomMargin},
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
                    issue.resolved ? styles.issueIdResolved : null,
                    zoomedInTextStyle
                  ]}
                  testID="card-simple-issue-id"
                >
                  {ApiHelper.getIssueId(issue)}
                </Text>
              </View>

              {zoomedIn && (
                <View style={styles.assignees}>
                  {this.renderEstimation()}
                  {this.renderAssignees()}
                </View>
              )}

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
                  {issue?.summary}
                </Text>
              </Text>

              {Boolean(zoomedIn && issue.tags) && <Tags tags={issue.tags} style={styles.tags} multiline={true}/>}
            </View>

          </View>
        </View>

      </View>
    );
  }
}
