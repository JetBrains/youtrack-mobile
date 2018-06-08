/* @flow */
import {View, Text, Image} from 'react-native';
import React, {Component} from 'react';
import {visibilitySmall} from '../../components/icon/icon';

import styles from './comment__visibility.styles';

type Props = {
  visibility: ?string
};

export default class CommentVisibility extends Component<Props, void> {

  constructor() {
    super();
  }

  render() {
    if (this.props.visibility) {
      return (
        <View style={styles.visibility}>
          <Image style={styles.visibilityIcon} source={visibilitySmall}/>
          <Text style={styles.visibilityText}>{this.props.visibility}</Text>
        </View>
      );
    }
    return null;
  }
}
