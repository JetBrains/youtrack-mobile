import { Linking } from 'react-native';

import {waitFor} from '@testing-library/react-native';

import {
  extractIssueId,
  extractArticleId,
  openByUrlDetector,
} from './open-url-handler';

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  getInitialURL: jest.fn().mockResolvedValue(''),
  addEventListener: jest.fn(),
}));

describe("open-url-handler", () => {
  describe("extractIssueId", () => {
    it("should return NULL if URI is not provided", () => {
      expect(extractIssueId()).toEqual(null);
    });

    it("should extract issue id from a not encoded URI", () => {
      expect(extractIssueId("https://sample.com/issue/X-a_X-1")).toEqual(
        "X-a_X-1"
      );
    });

    it("should extract issue id from an encoded URI", () => {
      expect(
        extractIssueId("https://sample.com/oauth?state=%2Fissue%2FXX-1")
      ).toEqual("XX-1");
    });
  });

  describe("extractArticleId", () => {
    it("should return NULL if URI is not provided", () => {
      expect(extractArticleId()).toEqual(null);
    });
    it("should extract issue id from a not encoded URI", () => {
      expect(
        extractArticleId("https://sample.com/articles/X-X-123-45")
      ).toEqual("X-X-123-45");
    });
  });

  describe("openByUrlDetector", () => {
    let idMock: string;
    let urlMock: string;
    let onIdDetected: (
      url: string,
      issueId?: string,
      articleId?: string
    ) => any;
    let onQueryDetected: (url: string, query: string) => any;

    beforeEach(() => {
      idMock = "ID-1";
      urlMock = `https://example.com/issue/${idMock}`;
      onIdDetected = jest.fn();
      onQueryDetected = jest.fn();
    });

    it("should invoke issue id detect callback", async () => {
      Linking.getInitialURL.mockResolvedValueOnce(urlMock);

      await openByUrlDetector(onIdDetected, onQueryDetected);

      waitFor(() => {
        expect(onIdDetected).toHaveBeenCalledWith(urlMock, idMock, undefined);
      });
    });

    it("should invoke article id detect callback", async () => {
      urlMock = `https://example.com/articles/${idMock}`;
      Linking.getInitialURL.mockResolvedValueOnce(urlMock);

      await openByUrlDetector(onIdDetected, onQueryDetected);

      waitFor(() => {
        expect(onIdDetected).toHaveBeenCalledWith(urlMock, undefined, idMock);
      })
    });

    it("should subscribe to press URL event", () => {
      openByUrlDetector(jest.fn(), jest.fn());

      expect(Linking.addEventListener).toHaveBeenCalledWith(
        "url",
        expect.any(Function)
      );
    });
  });
});
