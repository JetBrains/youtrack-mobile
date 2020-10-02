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
      url: attachmentMockUrl
    };
  });


  describe('Render image', () => {
    it('should render image', () => {
      renderImage();

      expect(findByTestId('attachmentImage')).toHaveLength(1);
      expect(findByTestId('attachmentSvg')).toHaveLength(0);
      expect(findByTestId('attachmentFile')).toHaveLength(0);
      expect(findByTestId('attachmentRemove')).toHaveLength(0);
    });

    it('should render remove image button', () => {
      renderImage(true);
      expect(findByTestId('attachmentRemove')).toHaveLength(1);
    });
  });


  describe('Render SVG', () => {
    it('should render SVG', () => {
      renderWithMimeType('image/svg+xml');

      expect(findByTestId('attachmentImage')).toHaveLength(0);
      expect(findByTestId('attachmentSvg')).toHaveLength(1);
      expect(findByTestId('attachmentFile')).toHaveLength(0);
    });
  });


  describe('Render file', () => {
    it('should render file', () => {
      renderFile();

      expect(findByTestId('attachmentImage')).toHaveLength(0);
      expect(findByTestId('attachmentSvg')).toHaveLength(0);
      expect(findByTestId('attachmentFile')).toHaveLength(1);
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


  describe('openAttachmentUrl', () => {
    it('should show image attachment', async () => {
      renderFile();
      instance.openAttachmentUrl = jest.fn();
      instance.forceUpdate();

      findByTestId('attachment').simulate('press');
      expect(instance.openAttachmentUrl).toHaveBeenCalledWith(attachmentMockName, attachmentMockUrl);
    });
  });


  function renderImage(canRemoveImage) {
    renderWithMimeType('image/png', canRemoveImage);
  }

  function renderFile(canRemoveImage) {
    renderWithMimeType('application/stream', canRemoveImage);
  }

  function renderWithMimeType(mimeType: string, canRemoveImage: boolean) {
    render({
      mimeType: mimeType
    }, canRemoveImage);
  }

  function render(attachment: Attachment, canRemoveImage: boolean) {
    wrapper = doShallow(Object.assign({}, attachmentMock, attachment), canRemoveImage);
    instance = wrapper.instance();
  }

  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(attachment: Attachment, canRemoveImage: boolean = false) {
    return shallow(
      <Attachment
        attach={attachment}
        canRemoveImage={canRemoveImage}
        uiTheme={DEFAULT_THEME}
      />
    );
  }
});
