/* @flow */

import styles from './single-issue.styles';

import {View, Text, TouchableOpacity} from 'react-native';
import React, {PureComponent} from 'react';
import {formatDate, shortRelativeDate, getEntityPresentation} from '../../components/issue-formatter/issue-formatter';
import type {User} from '../../flow/User';

const TOUCH_PADDING = 10;

const moreButtonHitSlop = {
  top: TOUCH_PADDING,
  left: TOUCH_PADDING,
  bottom: TOUCH_PADDING,
  right: TOUCH_PADDING
};

type Props = {
  created: number,
  updated: number,
  reporter: User,
  updater: User,
}

type State = {
  showAdditionalDate: boolean
}

export default class TopPanel extends PureComponent<Props, State> {
  state: State = {
    showAdditionalDate: false
  };

  _getUserName(user: User) {
    return getEntityPresentation(user);
  }

  render() {
    const {created, updated, reporter, updater} = this.props;

    if (!created || !reporter) {
      return null;
    }

    return (
      <View style={styles.issueTopMessage}>

        <View>
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1}}>
              <Text style={styles.issueTopText} selectable={true} numberOfLines={1}>
                Created by {this._getUserName(reporter)} {shortRelativeDate(created)}
              </Text>
            </View>
            {!this.state.showAdditionalDate &&
            <TouchableOpacity onPress={() => this.setState({showAdditionalDate: true})} hitSlop={moreButtonHitSlop}>
              <Text style={styles.showMoreDateButton}>more</Text>
            </TouchableOpacity>}
          </View>

          {this.state.showAdditionalDate && <Text style={styles.issueTopText}>{formatDate(created)}</Text>}
        </View>

        {Boolean(updater && updated) && this.state.showAdditionalDate ?
          <View style={styles.updatedInformation}>
            <Text style={styles.issueTopText} selectable={true} numberOfLines={2}>
              Updated by {this._getUserName(updater)} {shortRelativeDate(updated)}
            </Text>
            {this.state.showAdditionalDate && <Text style={styles.issueTopText}>{formatDate(updated)}</Text>}
          </View>
          : null}

      </View>
    );
  }
}
