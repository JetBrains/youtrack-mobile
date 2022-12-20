/* @flow */

import React from 'react';

import IconPrDeclined from 'components/icon/assets/pull-request-declined.svg';
import IconPrMerged from 'components/icon/assets/pull-request-merged.svg';
import IconPrOpen from '@jetbrains/icons/pr-open.svg';
import IconVcs from '@jetbrains/icons/commit.svg';
import {IconHistory, IconWork} from 'components/icon/icon';
import {pullRequestState} from './activity__stream-vcs-helper';

import styles from './activity__stream.styles';

type Props = {
  activityGroup: Object
}


const ActivityIcon = ({activityGroup}: Props): any => {
  let icon;
  const iconColor: string = styles.activityIcon.color;

  switch (true) {
  case activityGroup.vcs != null:
    const iconProps: {fill: string, width: number, height: number} = {fill: iconColor, width: 24, height: 24};
    if (activityGroup.vcs?.pullRequest) {
      switch (activityGroup.vcs.added[0].state.id) {
      case pullRequestState.OPEN: {
        icon = <IconPrOpen {...iconProps}/>;
        break;
      }
      case pullRequestState.MERGED: {
        icon = <IconPrMerged {...iconProps}/>;
        break;
      }
      case pullRequestState.DECLINED: {
        icon = <IconPrDeclined {...iconProps}/>;
        break;
      }
      }
    } else {
      icon = <IconVcs {...iconProps}/>;
    }
    break;

  case activityGroup.work != null:
    icon = <IconWork size={24} color={iconColor} style={styles.activityWorkIcon}/>;
    break;

  default:
    icon = <IconHistory size={26} color={iconColor}/>;
  }

  return icon;
};

export default ActivityIcon;
