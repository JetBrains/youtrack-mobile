/* @flow */

import styles from './single-issue.styles';

import {View, Text, TouchableOpacity} from 'react-native';
import React, {Component} from 'react';
import Tags from '../../components/tags/tags';
import {formatDate, shortRelativeDate, getEntityPresentation} from '../../components/issue-formatter/issue-formatter';
import type {IssueFull} from '../../flow/Issue';

const TOUCH_PADDING = 10;

const moreButtonHitSlop = {
  top: TOUCH_PADDING, left: TOUCH_PADDING, bottom: TOUCH_PADDING, right: TOUCH_PADDING
};

type Props = {
  issue: IssueFull,
  onTagPress: (query: string) => any
}

type State = {
  showAdditionalDate: boolean
}

export default class TopPanel extends Component<Props, State> {
  state: State = {
    showAdditionalDate: false
  }

  _getUserName(user) {
    return `${getEntityPresentation(user)}`;
  }

  _renderUpdatedCreated(issue) {
    return (
      <View style={styles.issueTopMessage}>

        <View>
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1}}>
              <Text style={styles.issueTopText} selectable={true} numberOfLines={1}>
                Created by {this._getUserName(issue.reporter)} {shortRelativeDate(issue.created)}
              </Text>
            </View>
            {!this.state.showAdditionalDate &&
            <TouchableOpacity onPress={() => this.setState({showAdditionalDate: true})} hitSlop={moreButtonHitSlop}>
              <Text style={styles.showMoreDateButton}>more</Text>
            </TouchableOpacity>}
          </View>

          {this.state.showAdditionalDate && <Text style={styles.issueTopText}>{formatDate(issue.created)}</Text>}
        </View>

        {issue.updater && this.state.showAdditionalDate ?
          <View style={styles.updatedInformation}>
            <Text style={styles.issueTopText} selectable={true} numberOfLines={2}>
              Updated by {this._getUserName(issue.updater)} {shortRelativeDate(issue.updated)}
            </Text>
            {this.state.showAdditionalDate && <Text style={styles.issueTopText}>{formatDate(issue.updated)}</Text>}
          </View>
          : null}

      </View>
    );
  }

  render() {
    const {issue} = this.props;
    return (
      <View>
        <Tags
          tags={issue.tags}
          onTagPress={(query) => this.props.onTagPress(query)}
        />

        {this._renderUpdatedCreated(issue)}
      </View>
    );
  }
}
