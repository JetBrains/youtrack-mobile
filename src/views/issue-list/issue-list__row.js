import styles from './issue-list.styles';
import ColorField from '../../components/color-field/color-field';
import {next} from '../../components/icon/icon';
import {COLOR_FONT_GRAY} from '../../components/variables/variables';
import {getPriotityField, getForText} from '../../components/issue-formatter/issue-formatter';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import React from 'react';

export default class IssueRow extends React.Component {
  static _getSubText(issue) {
    const issueIdStyle = issue.resolved ? {textDecorationLine: 'line-through'} : null;

    return (<Text>
      <Text style={issueIdStyle}>{issue.project.shortName}-{issue.numberInProject}</Text>
      <Text> by {issue.reporter.fullName || issue.reporter.login} {getForText(issue.fieldHash.Assignee)}</Text>
    </Text>);  }

  getSummaryStyle(issue) {
    if (issue.resolved) {
      return {color: COLOR_FONT_GRAY, fontWeight: '200'};
    }
  }

  render() {
    const issue = this.props.issue;
    const priorityField = getPriotityField(issue);
    const prioityBlock = (priorityField && priorityField.value) ?
      <ColorField text={priorityField.value.name} color={priorityField.value.color}></ColorField> :
      <View style={styles.priorityPlaceholder}/>;

    return (
      <TouchableOpacity onPress={() => this.props.onClick(issue)} testID="issue-row">
        <View style={styles.row}>

          <View>
            <View style={styles.priorityWrapper}>{prioityBlock}</View>
          </View>

          <View style={styles.rowText}>

            <View style={styles.rowTopLine}>
              <Text style={[styles.summary, this.getSummaryStyle(issue)]} numberOfLines={2} testID="issue-row-summary">
                {issue.summary}
              </Text>
              <Image style={styles.arrowImage} source={next}></Image>
            </View>

            <Text style={styles.subtext} numberOfLines={1} testID="issue-row-details">{IssueRow._getSubText(issue)}</Text>

          </View>
        </View>
      </TouchableOpacity>
    );
  }
}
