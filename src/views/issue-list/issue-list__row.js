/* @flow */
import React, {Component} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import ColorField from '../../components/color-field/color-field';
import Tags from '../../components/tags/tags';
import {
  getPriotityField,
  getEntityPresentation,
  relativeDate,
  getReadableID
} from '../../components/issue-formatter/issue-formatter';

import Avatar from '../../components/avatar/avatar';

import {ThemeContext} from '../../components/theme/theme-context';

import styles from './issue-list.styles';

import type {AnyIssue} from '../../flow/Issue';
import type {BundleValue} from '../../flow/CustomFields';
import type {Theme} from '../../flow/Theme';

type Props = {
  issue: AnyIssue,
  onClick: Function,
  onTagPress: (query: string) => any
};

export default class IssueRow extends Component<Props, void> {

  shouldComponentUpdate(nextProps: Props): boolean {
    return ['tags','links','fields','resolved','summary'].some((issueFieldName: string) => {
      return nextProps.issue[issueFieldName] !== this.props.issue[issueFieldName];
    });
  }

  renderPriority() {
    const priorityField = getPriotityField(this.props.issue);
    if (!priorityField || !priorityField.value || priorityField.value.length === 0) {
      return null;
    }
    const values: Array<BundleValue> = [].concat(priorityField.value);
    const LAST = values.length - 1;

    return (
      <ColorField
        style={styles.priorityWrapper}
        text={values[LAST].name}
        color={values[LAST].color}
      />
    );
  }

  render() {
    const {issue, onTagPress} = this.props;

    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => (
          <TouchableOpacity
            onPress={() => this.props.onClick(issue)}
            testID="issue-row"
          >
            <View style={styles.row}>
              <View
                testID="issue-row-details"
                style={styles.rowLine}
              >
                {this.renderPriority()}
                <Text
                  style={[styles.headLeft, issue.resolved ? {textDecorationLine: 'line-through'} : null]}>
                  {getReadableID(issue)}
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
                  issue.resolved ? {color: EStyleSheet.value('$resolved')} : null
                ]}
                numberOfLines={2}
                testID="issue-row-summary">
                {issue.summary}
              </Text>

              {Boolean(issue.tags && issue.tags.length) &&
              <Tags tags={issue.tags} onTagPress={onTagPress} style={styles.tags}/>
              }

            </View>
          </TouchableOpacity>
        )}
      </ThemeContext.Consumer>
    );
  }
}
