import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';

import Attach from './attachment';
import Router from 'components/router/router';
import {DEFAULT_THEME} from 'components/theme/theme';

import {Attachment} from 'types/CustomFields';

jest.mock('react-native-svg', () => ({
  SvgUri: 'SvgUri',
}));

const attachmentMockName = 'attachName';
const attachmentMockUrl = 'http://example.com?attach';

describe('<Attachment/>', () => {
  let instance: Attach;
  let onOpenAttachmentCallback: jest.Mock;
  let attachmentMock: Attachment;

  beforeEach(() => {
    onOpenAttachmentCallback = jest.fn();
    attachmentMock = {
      id: 'attachId',
      name: attachmentMockName,
      url: attachmentMockUrl,
    } as Attachment;
  });


  describe('Render thumb', () => {
    it('should render IMAGE thumb', () => {
      renderImage();

      expect(screen.findByTestId('attachmentImage')).toBeTruthy();
      expect(screen.queryByTestId('attachmentSvg')).toBeNull();
      expect(screen.queryByTestId('attachmentFile')).toBeNull();
      expect(screen.queryByTestId('attachmentRemove')).toBeNull();
    });

    it('should render SVG thumb', () => {
      renderWithMimeType('image/svg+xml');

      expect(screen.findByTestId('attachmentSvg')).toBeTruthy();
      expect(screen.queryByTestId('attachmentImage')).toBeNull();
      expect(screen.queryByTestId('attachmentFile')).toBeNull();
    });

    it('should render FILE thumb', () => {
      renderStream();

      expect(screen.queryByTestId('attachmentImage')).toBeNull();
      expect(screen.queryByTestId('attachmentSvg')).toBeNull();
      expect(screen.getByTestId('attachmentFile')).toBeTruthy();
    });

    it('should render VIDEO attachment thumb', () => {
      renderVideo();

      expect(screen.queryByTestId('attachmentImage')).toBeNull();
      expect(screen.queryByTestId('attachmentSvg')).toBeNull();
      expect(screen.queryByTestId('attachmentFile')).toBeNull();
      expect(screen.getByTestId('attachmentMedia')).toBeTruthy();
    });

    it('should render remove image button', () => {
      renderImage(true);

      expect(screen.getByTestId('attachmentRemove')).toBeTruthy();
    });
  });


  describe('showImageAttachment', () => {
    it('should show image attachment', async () => {
      Router.PreviewFile = jest.fn();

      renderImage();
      fireEvent.press(screen.getByTestId('attachment'));

      expect(onOpenAttachmentCallback).toHaveBeenCalledWith(
        'image',
        attachmentMock.id,
      );
    });
  });


  describe('Remove attachment permission', () => {
    it('should use props fn check if attachment can be removed', async () => {
      const userCanRemoveImageMock = jest.fn().mockReturnValueOnce(true);
      instance = new Attach({attach: attachmentMock, userCanRemoveImage: userCanRemoveImageMock});

      expect(instance.canRemove()).toEqual(true);
    });

    it('should fallback to props param to check if attachment can be removed', async () => {
      instance = new Attach({attach: attachmentMock, canRemoveImage: true});

      expect(instance.canRemove()).toEqual(true);
    });
  });


  describe('openAttachmentUrl', () => {
    it('should show image attachment', async () => {
      Router.AttachmentPreview = jest.fn();
      renderStream();

      fireEvent.press(screen.getByTestId('attachment'));

      expect(onOpenAttachmentCallback).toHaveBeenCalledWith(
        'file',
        attachmentMockName,
      );
    });
  });

  function renderImage(canRemoveImage?: boolean) {
    return renderWithMimeType('image/png', canRemoveImage);
  }

  function renderVideo(canRemoveImage?: boolean) {
    return renderWithMimeType('video/avi', canRemoveImage);
  }

  function renderStream(canRemoveImage?: boolean) {
   return renderWithMimeType('application/stream', canRemoveImage);
  }

  function renderWithMimeType(mimeType: string, canRemoveImage?: boolean) {
    return doRender(
      {...attachmentMock, mimeType},
      canRemoveImage,
    );
  }

  function doRender(attachment: Attachment, canRemoveImage?: boolean, userCanRemoveImage?: () => boolean) {
    return render(
      <Attach
        attach={attachment}
        attachments={[]}
        canRemoveImage={canRemoveImage}
        uiTheme={DEFAULT_THEME}
        userCanRemoveImage={userCanRemoveImage}
        onOpenAttachment={onOpenAttachmentCallback}
      />
    );
  }
});
