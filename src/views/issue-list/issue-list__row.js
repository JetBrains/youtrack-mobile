/* @flow */
import React, {Component} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import type {IssueOnList} from '../../flow/Issue';
import type {BundleValue} from '../../flow/CustomFields';

import ColorField from '../../components/color-field/color-field';
import Tags from '../../components/tags/tags';
import {
  getPriotityField,
  getEntityPresentation,
  relativeDate
} from '../../components/issue-formatter/issue-formatter';

import styles from './issue-list.styles';
import commonIssueStyles from '../../components/common-styles/issue';
import Avatar from '../../components/avatar/avatar';

type Props = {
  issue: IssueOnList,
  onClick: Function,
  onTagPress: (query: string) => any
};

export default class IssueRow extends Component<Props, void> {

  renderPriority() {
    const priorityField = getPriotityField(this.props.issue);
    if (!priorityField || !priorityField.value || priorityField.value.length === 0) {
      return <View style={styles.priorityPlaceholder}/>;
    }
    const values: Array<BundleValue> = [].concat(priorityField.value);
    const LAST = values.length - 1;

    return (
      <ColorField
        text={values[LAST].name}
        color={values[LAST].color}
      />
    );
  }

  render() {
    const {issue, onTagPress} = this.props;


    return (
      <TouchableOpacity
        onPress={() => this.props.onClick(issue)}
        testID="issue-row"
      >
        <View style={styles.row}>
          <View
            testID="issue-row-details"
            style={styles.rowLine}
          >
            <View style={styles.priorityWrapper}>{this.renderPriority()}</View>
            <Text
              style={[styles.headLeft, issue.resolved ? {textDecorationLine: 'line-through'} : null]}>
              {issue.idReadable}
            </Text>

            <View style={styles.headRight}>
              <Text style={styles.secondaryText}>{`${relativeDate(issue.created)}  `}</Text>
              <Avatar
                userName={getEntityPresentation(issue.reporter)}
                size={20}
                source={{uri: issue.reporter?.avatarUrl}}
              />
            </View>
          </View>

          <Text
            style={[
              styles.summary,
              issue.resolved ? commonIssueStyles.resolvedSummary : null
            ]}
            numberOfLines={2}
            testID="issue-row-summary">
            {issue.summary}
          </Text>

          {Boolean(issue.tags && issue.tags.length) &&
          <Tags inline={true} tags={issue.tags} onTagPress={onTagPress}/>
          }

        </View>
      </TouchableOpacity>
    );
  }
}
