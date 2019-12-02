/* @flow */

import {View, Text, TouchableOpacity} from 'react-native';
import React, {PureComponent} from 'react';

import {formatDate, shortRelativeDate, getEntityPresentation} from '../../components/issue-formatter/issue-formatter';
import Icon from 'react-native-vector-icons/FontAwesome';
import {COLOR_FONT_GRAY} from '../../components/variables/variables';

import styles from './single-issue.styles';

import type {User} from '../../flow/User';


type Props = {
  reporter: User,
  created: number,
  updater: User,
  updated: number
}

type State = {
  showAdditionalDate: boolean
}

export default class TopPanel extends PureComponent<Props, State> {
  state: State = {
    showAdditionalDate: false
  };

  _getUserName(user: User) {
    return user ? getEntityPresentation(user) : '';
  }

  _getDate(timestamp: number, isRelative?: boolean) {
    const formatter = isRelative ? shortRelativeDate : formatDate;
    return timestamp ? formatter(timestamp) : '';
  }

  render() {
    const {reporter, created, updater, updated} = this.props;
    const {showAdditionalDate} = this.state;

    return (
      <View style={styles.issueTopPanel}>

        <TouchableOpacity onPress={
          () => this.setState({showAdditionalDate: !showAdditionalDate})
        }>
          <Text>
            <Text
              style={styles.issueTopPanelText}
              numberOfLines={1}
              selectable={true}
            >
              Created by {this._getUserName(reporter)} {this._getDate(created, true)}
            </Text>
            <Text>{' '}</Text>
            <Icon name={showAdditionalDate ? 'angle-up' : 'angle-down'} color={COLOR_FONT_GRAY}/>
          </Text>

          {showAdditionalDate && <Text style={styles.issueTopPanelText}>{this._getDate(created)}</Text>}

          {showAdditionalDate &&
          <View style={styles.topPanelUpdatedInformation}>
            <Text
              style={styles.issueTopPanelText}
              numberOfLines={2}
              selectable={true}
            >
              Updated by {this._getUserName(updater)} {this._getDate(updated, true)}
            </Text>
            <Text style={styles.issueTopPanelText}>{this._getDate(updated)}</Text>
          </View>}
        </TouchableOpacity>

      </View>
    );
  }
}
