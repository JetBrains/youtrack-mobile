/* @flow */

import type {Node} from 'react';
import React from 'react';
import {Text, View} from 'react-native';

import {getEntityPresentation, ytDate} from '../issue-formatter/issue-formatter';

import styles from './issue-tabbed.style';

import type {User} from 'flow/User';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = { reporter: User, updater: User, created: number, updated: number, style?: ViewStyleProp };


const CreateUpdateInfo = (props: Props): Node => {
  return (
    <View style={[styles.createUpdateInfoPanel, props.style]}>
      {!!props.reporter && <Text
        style={styles.createUpdateInfoText}
        selectable={true}
      >
        Created by {getEntityPresentation(props.reporter)} {props.created ? ytDate(props.created) : ''}
      </Text>}

      {!!props.updater && <Text
        style={styles.createUpdateInfoText}
        selectable={true}
      >
        Updated by {getEntityPresentation(props.updater)} {props.updated ? ytDate(props.updated) : ''}
      </Text>}
    </View>
  );
};

export default CreateUpdateInfo;
