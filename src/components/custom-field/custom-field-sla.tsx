import React from 'react';

import IconPaused from '@jetbrains/icons/paused.svg';

import ColorField from 'components/color-field/color-field';
import {formatSLADistanceToBreach, ytDate} from 'components/date/date';
import {i18n} from 'components/i18n/i18n';

import styles from './custom-field-sla.styles';

import {CustomFieldBase} from 'types/CustomFields';
import {ViewStyleProp} from 'types/Internal';
import {View} from 'react-native';

const CustomFieldSLA = ({field, absDate, style}: {field: CustomFieldBase; absDate: boolean; style?: ViewStyleProp}) => {
  const createColorCode = () => {
    return {
      id: '',
      foreground: styles.slaDefaultStyle.color,
      background:
        new Date().getTime() > field.value ? styles.slaOverdue.backgroundColor : styles.slaDefaultStyle.backgroundColor,
    };
  };

  const renderSLADateTag = () => {
    const text = absDate
      ? ytDate(field.value as number)
      : `${new Date().getTime() > field.value ? '-' : ''}${formatSLADistanceToBreach(field.value as number)}`;
    return <ColorField style={styles.slaField} color={createColorCode()} text={text} fullText={true} />;
  };

  const renderSLAPausedTag = () => {
    return (
      <ColorField
        style={styles.slaPaused}
        color={{
          id: '',
          foreground: styles.slaPaused.color,
          background: '',
        }}
        text={i18n('Paused')}
        fullText={true}
      >
        <IconPaused style={styles.slaPausedIcon} fill={styles.slaPausedIcon.color} width={13} height={13} />
      </ColorField>
    );
  };

  return <View style={style}>{field.pausedTime ? renderSLAPausedTag() : renderSLADateTag()}</View>;
};

export default React.memo(CustomFieldSLA);
