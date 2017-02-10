/* @flow */

import styles from './single-issue.styles';

import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import ColorField from '../../components/color-field/color-field';
import {formatDate, shortRelativeDate} from '../../components/issue-formatter/issue-formatter';
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

export default class TopPanel extends React.Component {
  props: Props;
  state: State = {
    showAdditionalDate: false
  }

  _getUserName(user) {
    return `${user.fullName || user.login}`;
  }

  _renderTags(tags) {
    if (!tags || !tags.length) {
      return;
    }

    return <View style={styles.tagsContainer}>
      {tags.map(tag => {
        return (
          <TouchableOpacity onPress={() => this.props.onTagPress(tag.query)} key={tag.id} style={styles.tagButton}>
            <ColorField text={tag.name} color={tag.color} fullText={true} style={styles.tagColorField}/>
          </TouchableOpacity>
        );
      })}
    </View>;
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
        {this._renderTags(issue.tags)}
        {this._renderUpdatedCreated(issue)}
      </View>
    );
  }
}
