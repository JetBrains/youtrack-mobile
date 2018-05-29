/* @flow */
import {View, Text, Image} from 'react-native';
import React, {Component} from 'react';

import {visibilitySmall} from '../../components/icon/icon';

import {getVisibilityPresentation} from '../../components/issue-formatter/issue-formatter';
import IssuePermissions from '../issue-permissions/issue-permissions';

import styles from './comment__visibility.styles';

type Props = {
  comment: Object
};

export default class CommentVisibility extends Component<Props, void> {

  constructor() {
    super();
  }

  render() {
    if (!this.props.comment || !IssuePermissions.isSecured(this.props.comment)) {
      return null;
    }

    return (
      <View style={styles.visibility}>
        <Image style={styles.visibilityIcon} source={visibilitySmall}/>
        <Text style={styles.visibilityText}>{getVisibilityPresentation(this.props.comment)}</Text>
      </View>
    );
  }
}
