import * as React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import usage from 'components/usage/usage';
import {HIT_SLOP} from 'components/common-styles';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';
import {IconChevronDownUp} from 'components/icon/icon';
import {ytDate} from 'components/date/date';

import styles from './issue-tabbed.style';

import type {User} from 'types/User';
import type {ViewStyleProp} from 'types/Internal';

interface Props {
  analyticId: string;
  reporter: User;
  updater: User;
  created: number;
  updated: number;
  style?: ViewStyleProp;
}

const CreateUpdateInfo = (props: Props): JSX.Element => {
  const [expanded, updateExpanded] = React.useState(false);

  const createLine = (user: User, label: string, date: number) => {
    return <Text style={styles.createUpdateInfoText} selectable={true}>
      {`${label} ${getEntityPresentation(user)} `}
      <Text style={styles.createUpdateInfoText}>{props.created ? ytDate(date) : ''}</Text>
    </Text>;
  };

  return (
    <View style={[styles.createUpdateInfoPanel, props.style]}>
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        style={styles.createUpdateInfoPanelButton}
        onPress={() => {
          usage.trackEvent(props.analyticId, 'toggleCreatedUpdated');
          updateExpanded(!expanded);
        }}
      >
        {props.reporter && createLine(props.reporter, i18n('Created by'), props.created)}
        <IconChevronDownUp isDown={!expanded} size={20} color={styles.createUpdateInfoText.color}/>

      </TouchableOpacity>
      <View>{props.updater && expanded && createLine(props.updater, i18n('Updated by'), props.updated)}</View>
    </View>
  );
};

export default CreateUpdateInfo;
