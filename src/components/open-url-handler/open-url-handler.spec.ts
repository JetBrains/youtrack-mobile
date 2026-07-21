import { Linking } from 'react-native';

import {
  extractIssueId,
  extractArticleId,
  openByUrlDetector,
  extractHelpdeskFormId,
} from './open-url-handler';

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  getInitialURL: jest.fn().mockResolvedValue(''),
  addEventListener: jest.fn(),
}));

describe('Parse URL', () => {
  describe('extractIssueId', () => {
    it('should return NULL if URI is not provided', () => {
      expect(extractIssueId()).toEqual(null);
    });

    it('should extract issue id from a not encoded URI', () => {
      expect(extractIssueId('https://sample.com/issue/X-a_X-1')).toEqual(
        'X-a_X-1'
      );
    });

    it('should extract ticket id from a not encoded URI', () => {
      expect(extractIssueId('https://sample.com/tickets/X-a_X-1')).toEqual(
        'X-a_X-1'
      );
    });

    it('should extract issue id from an encoded URI', () => {
      expect(
        extractIssueId('https://sample.com/oauth?state=%2Fissue%2FXX-1')
      ).toEqual('XX-1');
    });

    it('should stop at the title slug and not capture it', () => {
      expect(
        extractIssueId('http://localhost:8088/issue/DEMO-11/Import-issues-and-articles')
      ).toEqual('DEMO-11');
    });

    it('should not extract an issue id from an article URL whose slug mentions issues', () => {
      expect(
        extractIssueId('http://localhost:8088/articles/HD-A-1/Getting-Started-with-the-Knowledge-Base-in-YouTrack')
      ).toEqual(null);
    });
  });

  describe('extractArticleId', () => {
    it('should return NULL if URI is not provided', () => {
      expect(extractArticleId()).toEqual(null);
    });
    it('should extract issue id from a not encoded URI', () => {
      expect(
        extractArticleId('https://sample.com/articles/X-X-123-45')
      ).toEqual('X-X-123-45');
    });

    it('should stop at the title slug and not capture it', () => {
      expect(
        extractArticleId('http://localhost:8088/articles/HD-A-1/Getting-Started-with-the-Knowledge-Base-in-YouTrack')
      ).toEqual('HD-A-1');
    });

    it('should not extract an article id from an issue URL whose slug mentions articles', () => {
      expect(
        extractArticleId('http://localhost:8088/issue/DEMO-11/Import-issues-and-articles')
      ).toEqual(null);
    });
  });

  describe('extractFormId', () => {
    it('should return NULL if URI is not provided', () => {
      expect(extractHelpdeskFormId()).toEqual(null);
    });
    it('should extract issue id from a not encoded URI', () => {
      expect(
        extractHelpdeskFormId('http://sample.com/form/999-eee--123-45')
      ).toEqual('999-eee--123-45');
    });

    it('should extract a full uuid form id', () => {
      expect(
        extractHelpdeskFormId('http://localhost:8088/form/81f2c3d4-5678-90ab-cdef-1234567890ab')
      ).toEqual('81f2c3d4-5678-90ab-cdef-1234567890ab');
    });

    it('should stop at the title slug and not capture it', () => {
      expect(
        extractHelpdeskFormId('http://localhost:8088/form/999-eee--123-45/Contact-Support')
      ).toEqual('999-eee--123-45');
    });

    it('should not extract a form id from issue or article URLs', () => {
      expect(
        extractHelpdeskFormId('http://localhost:8088/issue/DEMO-11/Import-issues-and-articles')
      ).toEqual(null);
      expect(
        extractHelpdeskFormId('http://localhost:8088/articles/HD-A-1/Getting-Started-with-the-Knowledge-Base-in-YouTrack')
      ).toEqual(null);
    });
  });

  describe('openByUrlDetector runtime subscription', () => {
    it('should only subscribe to URLs opened while the app is running (cold-start URLs are handled during app init)', () => {
      const onIdDetected = jest.fn();
      const onQueryDetected = jest.fn();

      openByUrlDetector(onIdDetected, onQueryDetected);

      expect(Linking.addEventListener).toHaveBeenCalledWith('url', expect.any(Function));
    });
  });
});
