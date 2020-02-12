import React from 'react';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import Attachment from './attachment';

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

  describe('Render', () => {
    it('should match a snapshot', () => {
      renderImage();
      expect(toJson(wrapper)).toMatchSnapshot();
    });
  });


  describe('Render image', () => {
    it('should render image', () => {
      renderImage();

      expect(findByTestId('attachmentImage')).toHaveLength(1);
      expect(findByTestId('attachmentSvg')).toHaveLength(0);
      expect(findByTestId('attachmentFile')).toHaveLength(0);
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


  function renderImage() {
    renderWithMimeType('image/png');
  }

  function renderFile() {
    renderWithMimeType('application/stream');
  }

  function renderWithMimeType(mimeType: string) {
    render({
      mimeType: mimeType
    });
  }

  function render(attachment: Attachment) {
    wrapper = doShallow(Object.assign({}, attachmentMock, attachment));
    instance = wrapper.instance();
  }

  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(attachment: Attachment) {
    return shallow(
      <Attachment
        attach={attachment}
      />
    );
  }
});
