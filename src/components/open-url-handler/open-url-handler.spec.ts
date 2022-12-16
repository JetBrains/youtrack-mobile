import {extractIssueId, extractArticleId} from './open-url-handler';

describe('open-url-handler', () => {

  describe('extractIssueId', () => {
    it('should return NULL if URI is not provided', () => {
      expect(extractIssueId()).toEqual(null);
    });

    it('should extract issue id from a not encoded URI', () => {
      expect(extractIssueId('https://sample.com/issue/X-a_X-1')).toEqual('X-a_X-1');
    });

    it('should extract issue id from an encoded URI', () => {
      expect(extractIssueId('https://sample.com/oauth?state=%2Fissue%2FXX-1')).toEqual('XX-1');
    });
  });


  describe('extractArticleId', () => {
    it('should return NULL if URI is not provided', () => {
      expect(extractArticleId()).toEqual(null);
    });

    it('should extract issue id from a not encoded URI', () => {
      expect(extractArticleId('https://sample.com/articles/X-X-123-45')).toEqual('X-X-123-45');
    });
  });

});
