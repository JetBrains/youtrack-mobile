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

const CreateUpdateInfo = ({
  analyticId,
  reporter,
  updater,
  created,
  updated,
  style,
}: {
  analyticId: string;
  reporter: User;
  updater: User | null;
  created: number;
  updated: number;
  style?: ViewStyleProp;
}) => {
  const [expanded, updateExpanded] = React.useState(false);

  const createLine = (user: User, label: string, date: number) => {
    return (
      <Text style={styles.createUpdateInfoText} selectable={true}>
        {`${label} ${getEntityPresentation(user)} `}
        <Text style={styles.createUpdateInfoText}>{created ? ytDate(date) : ''}</Text>
      </Text>
    );
  };

  return (
    <View style={[styles.createUpdateInfoPanel, style]}>
      <TouchableOpacity
        disabled={!updater}
        hitSlop={HIT_SLOP}
        style={styles.createUpdateInfoPanelButton}
        onPress={() => {
          usage.trackEvent(analyticId, 'toggleCreatedUpdated');
          updateExpanded(!expanded);
        }}
      >
        {reporter && createLine(reporter, i18n('Created by'), created)}
        {updater && <IconChevronDownUp isDown={!expanded} size={20} color={styles.createUpdateInfoText.color} />}
      </TouchableOpacity>
      {updater && <View>{updater && expanded && createLine(updater, i18n('Updated by'), updated)}</View>}
    </View>
  );
};

export default CreateUpdateInfo;
