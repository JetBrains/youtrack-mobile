import React from 'react';

import {shallow} from 'enzyme';

import Attachment from './attachment';
import {DEFAULT_THEME} from '../theme/theme';

describe('<Attachment/>', () => {

  let wrapper;
  let instance;
  let attachmentMock;
  const attachmentMockName = 'attachName';
  const attachmentMockUrl = 'http://example.com?attach';

  beforeEach(() => {
    attachmentMock = {
      id: 'attachId',
      name: attachmentMockName,
      url: attachmentMockUrl,
    };
  });


  describe('Render thumb', () => {
    it('should render IMAGE thumb', () => {
      renderImage();

      expect(findByTestId('attachmentImage')).toHaveLength(1);
      expect(findByTestId('attachmentSvg')).toHaveLength(0);
      expect(findByTestId('attachmentFile')).toHaveLength(0);
      expect(findByTestId('attachmentRemove')).toHaveLength(0);
    });

    it('should render SVG thumb', () => {
      renderWithMimeType('image/svg+xml');

      expect(findByTestId('attachmentImage')).toHaveLength(0);
      expect(findByTestId('attachmentSvg')).toHaveLength(1);
      expect(findByTestId('attachmentFile')).toHaveLength(0);
    });

    it('should render FILE thumb', () => {
      renderStream();

      expect(findByTestId('attachmentImage')).toHaveLength(0);
      expect(findByTestId('attachmentSvg')).toHaveLength(0);
      expect(findByTestId('attachmentFile')).toHaveLength(1);
    });

    it('should render VIDEO attachment thumb', () => {
      renderVideo();

      expect(findByTestId('attachmentImage')).toHaveLength(0);
      expect(findByTestId('attachmentSvg')).toHaveLength(0);
      expect(findByTestId('attachmentFile')).toHaveLength(0);
      expect(findByTestId('attachmentMedia')).toHaveLength(1);
    });

    it('should render remove image button', () => {
      renderImage(true);
      expect(findByTestId('attachmentRemove')).toHaveLength(1);
    });
  });


  describe('showImageAttachment', () => {
    it('should show image attachment', async () => {
      renderImage();
      instance.showImageAttachment = jest.fn();
      instance.forceUpdate();

      findByTestId('attachment').simulate('press');

      expect(instance.showImageAttachment).toHaveBeenCalledWith(Object.assign(
        {},
        attachmentMock,
        {mimeType: 'image/png'},
        {url: attachmentMockUrl}
      ));
    });
  });

  describe('Remove attachment permission', () => {
    it('should use props fn check if attachment can be removed', async () => {
      render(attachmentMock, null, () => true);

      expect(instance.canRemove(attachmentMock)).toEqual(true);
    });

    it('should fallback to props param to check if attachment can be removed', async () => {
      render(attachmentMock, true);

      expect(instance.canRemove(attachmentMock)).toEqual(true);
    });
  });


  describe('openAttachmentUrl', () => {
    it('should show image attachment', async () => {
      renderStream();
      instance.openAttachmentUrl = jest.fn();
      instance.forceUpdate();

      findByTestId('attachment').simulate('press');
      expect(instance.openAttachmentUrl).toHaveBeenCalledWith(attachmentMockName, attachmentMockUrl);
    });
  });


  function renderImage(canRemoveImage) {
    renderWithMimeType('image/png', canRemoveImage);
  }

  function renderVideo(canRemoveImage) {
    renderWithMimeType('video/avi', canRemoveImage);
  }

  function renderStream(canRemoveImage) {
    renderWithMimeType('application/stream', canRemoveImage);
  }

  function renderWithMimeType(mimeType: string, canRemoveImage: boolean) {
    render({
      mimeType: mimeType,
    }, canRemoveImage);
  }

  function render(attachment: Attachment, canRemoveImage, userCanRemoveImage) {
    wrapper = doShallow(Object.assign({}, attachmentMock, attachment), canRemoveImage, userCanRemoveImage);
    instance = wrapper.instance();
  }

  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(attachment: Attachment, canRemoveImage, userCanRemoveImage) {
    return shallow(
      <Attachment
        attach={attachment}
        canRemoveImage={canRemoveImage}
        uiTheme={DEFAULT_THEME}
        userCanRemoveImage={userCanRemoveImage}
      />
    );
  }
});
