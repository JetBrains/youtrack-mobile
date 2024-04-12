import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import IconPaused from '@jetbrains/icons/paused.svg';

import BottomSheetModal from 'components/modal-panel-bottom/bottom-sheet-modal';
import ColorField from 'components/color-field/color-field';
import {formatSLADistanceToBreach, absDate as ytAbsDate} from 'components/date/date';
import {i18n} from 'components/i18n/i18n';

import styles from './custom-field-sla.styles';

import {CustomFieldSLA} from 'types/CustomFields';
import {ViewStyleProp} from 'types/Internal';

const CustomFieldSla = ({field, absDate, style}: {field: CustomFieldSLA; absDate: boolean; style?: ViewStyleProp}) => {
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);

  const createColorCode = () => {
    return {
      id: '',
      foreground: styles.slaDefaultStyle.color,
      background:
        new Date().getTime() > field.value ? styles.slaOverdue.backgroundColor : styles.slaDefaultStyle.backgroundColor,
    };
  };

  const renderSLADateTag = (isAbsDate: boolean) => {
    const text = isAbsDate
      ? ytAbsDate(field.value as number)
      : `${new Date().getTime() > field.value ? '-' : ''}${formatSLADistanceToBreach(field.value as number)}`;
    return <ColorField style={styles.slaField} color={createColorCode()} text={text} fullText={true} />;
  };

  const renderSLAPausedTag = () => {
    return (
      <ColorField
        style={{...styles.slaField, ...styles.slaPaused}}
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

  const pcf = field.projectCustomField.field;
  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={style}>
        {field.pausedTime ? renderSLAPausedTag() : renderSLADateTag(absDate)}
      </TouchableOpacity>
      <BottomSheetModal withHandle isVisible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>
            {pcf.localizedName || pcf.name || field.name}
          </Text>
          {field.pausedTime ? renderSLAPausedTag() : renderSLADateTag(true)}
        </View>
      </BottomSheetModal>
    </>
  );
};

export default React.memo(CustomFieldSla);
