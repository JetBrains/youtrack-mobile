import React from 'react';
import {View} from 'react-native';

import AttachmentErrorBoundary from 'components/attachments-row/attachment-error-boundary';
import FileMedia from 'components/attach-file/file-media';
import FilePreviewImage from 'components/attach-file/file-thumb-image';
import FileThumb from 'components/attachments-row/attachment-thumbnail';
import {hasMimeType} from 'components/mime-type/mime-type';

import type {ImageDimensions} from 'types/CustomFields';
import type {NormalizedAttachment} from 'types/Attachment';
import type {ViewStyleProp} from 'types/Internal';

const FilePreview = ({
  file,
  size,
  style,
  enableMediaPreview = false,
}: {
  file: NormalizedAttachment;
  size?: ImageDimensions;
  style?: ViewStyleProp;
  enableMediaPreview?: boolean;
}) => {
  const isMedia: boolean = hasMimeType.audio(file) || hasMimeType.video(file);

  return file.url ? (
    <AttachmentErrorBoundary attachName={file.name || 'file'}>
      <View style={style}>
        {isMedia && (
          <>
            {enableMediaPreview && <FileMedia file={file} size={size} />}
            {!enableMediaPreview && <FileThumb attach={file} />}
          </>
        )}
        {!isMedia &&
          (hasMimeType.image(file) ? <FilePreviewImage file={file} size={size} /> : <FileThumb attach={file} />)}
      </View>
    </AttachmentErrorBoundary>
  ) : null;
};

export default React.memo(FilePreview);
