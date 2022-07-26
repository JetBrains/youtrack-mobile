/* @flow */

import React from 'react';
import {Text, View} from 'react-native';

import StreamTimestamp from './activity__stream-timestamp';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';

import styles from './activity__stream.styles';

import type {Activity} from 'flow/Activity';

type Props = {
  activityGroup: Activity,
}

const StreamUserInfo = (props: Props) => {
  return (
    <View style={styles.activityAuthor}>
      <Text style={styles.activityAuthorName}>
        {getEntityPresentation(props.activityGroup.author)}
      </Text>
      {!!props.activityGroup.timestamp && (
        <Text><StreamTimestamp timestamp={props.activityGroup.timestamp}/></Text>
      )}
    </View>
  );
};

export default (React.memo<Props>(StreamUserInfo): React$AbstractComponent<Props, mixed>);
