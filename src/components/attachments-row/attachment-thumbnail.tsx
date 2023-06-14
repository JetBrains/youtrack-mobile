import React from 'react';
import {Text, View} from 'react-native';

import {attachmentCategories, FileCategoryKey} from './attachment-helper';

import styles from './attachments-row.styles';

import type {Attachment} from 'types/CustomFields';
import {NormalizedAttachment} from 'types/Attachment';
import {ViewStyleProp} from 'types/Internal';

interface FileTypeStyle {
  color: string;
  backgroundColor: string;
  borderColor: string;
}

interface Props {
  attach: Attachment | NormalizedAttachment;
  testID?: string;
  style?: ViewStyleProp;
}

const getThumbStyleMap = ():Record<FileCategoryKey, FileTypeStyle> => ({
  default: styles.attachmentDefault,
  audio: styles.attachmentMedia,
  sheet: styles.attachmentSheet,
  sketch: styles.attachmentSketch,
  text: styles.attachmentDoc,
  video: styles.attachmentMedia,
});



const getFileExt = (attach: Attachment | NormalizedAttachment): string => {
  return attach.name?.split?.('.')?.pop?.() || '';
};

const FileThumb = ({attach, testID = 'attachmentFile', style}: Props): JSX.Element => {
  let thumbStyle: FileTypeStyle = getThumbStyleMap().default;

  for (const key in attachmentCategories) {
    const isCategory: boolean = attachmentCategories[key as FileCategoryKey]
      .split(' ')
      .some((it: string) => it === getFileExt(attach));
    if (isCategory) {
      thumbStyle = getThumbStyleMap()[key as FileCategoryKey];
      break;
    }
  }
  return (
    <View
      testID={testID}
      style={[styles.attachmentThumbContainer, thumbStyle, style]}
    >
      <View style={styles.attachmentTypeContainer}>
        <View
          style={[
            styles.attachmentType,
            {
              backgroundColor: thumbStyle?.color,
            },
          ]}
        >
          <Text numberOfLines={1} style={styles.attachmentText}>
            {getFileExt(attach) || attach.name}
          </Text>
        </View>
      </View>

      <View style={styles.attachmentName}>
        <Text numberOfLines={2} style={styles.attachmentFileText}>
          {attach.name}
        </Text>
      </View>
    </View>
  );
};


export default React.memo<Props>(FileThumb);
