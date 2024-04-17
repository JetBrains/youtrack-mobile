import React from 'react';
import {ScrollView, TouchableOpacity} from 'react-native';

import FilePreview from 'components/attach-file/file-thumb';
import ModalPortal from 'components/modal-view/modal-portal';
import PreviewFile from 'views/preview-file/preview-file';
import {HIT_SLOP} from 'components/common-styles';
import {IconRemoveFilled} from 'components/icon/icon';

import styles from './files-preview.styles';

import type {NormalizedAttachment} from 'types/Attachment';
import type {ViewStyleProp} from 'types/Internal';

const FilesPreviewPanel = ({
  files = [],
  style,
  onRemove,
}: {
  files: NormalizedAttachment[];
  style?: ViewStyleProp;
  onRemove?: (f: NormalizedAttachment) => void;
}) => {
  const [preview, setPreview] = React.useState<React.ReactNode>(null);

  const onShowPreview = (file: NormalizedAttachment) => {
    setPreview(<PreviewFile file={file} files={files} onHide={() => setPreview(null)} />);
  };

  return (
    <>
      {!!files.length && (
        <ScrollView horizontal={true} style={style}>
          {files.map((file: NormalizedAttachment, i: number) => {
            return (
              <TouchableOpacity
                onPress={() => onShowPreview(file)}
                key={`file-${i}`}
                style={[styles.container, styles.size]}
              >
                <FilePreview file={file} size={styles.size} />
                {onRemove && (
                  <TouchableOpacity style={styles.removeButton} hitSlop={HIT_SLOP} onPress={() => onRemove(file)}>
                    <IconRemoveFilled size={24} color={styles.link.color} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
      <ModalPortal fullscreen onHide={() => setPreview(null)}>
        {preview}
      </ModalPortal>
    </>
  );
};

export default React.memo(FilesPreviewPanel);
