import React from 'react';
import {Text, View} from 'react-native';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';
import {ytDate} from 'components/date/date';
import styles from './issue-tabbed.style';
import type {User} from 'types/User';
import type {ViewStyleProp} from 'types/Internal';
type Props = {
  reporter: User;
  updater: User;
  created: number;
  updated: number;
  style?: ViewStyleProp;
};

const CreateUpdateInfo = (props: Props): React.ReactNode => {
  return (
    <View style={[styles.createUpdateInfoPanel, props.style]}>
      {!!props.reporter && (
        <Text style={styles.createUpdateInfoText} selectable={true}>
          Created by {getEntityPresentation(props.reporter)}{' '}
          {props.created ? ytDate(props.created) : ''}
        </Text>
      )}

      {!!props.updater && (
        <Text style={styles.createUpdateInfoText} selectable={true}>
          Updated by {getEntityPresentation(props.updater)}{' '}
          {props.updated ? ytDate(props.updated) : ''}
        </Text>
      )}
    </View>
  );
};

export default CreateUpdateInfo;
