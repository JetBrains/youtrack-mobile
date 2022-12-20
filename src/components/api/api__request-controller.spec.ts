import {
  fetch2,
  requestController,
  requestsMap,
} from './api__request-controller';
import {routeMap} from '../../app-routes';

describe('requestController', () => {
  beforeEach(() => {
    requestController.init();
  });
  describe('Request Map', () => {
    it('should define the requests map', () => {
      expect(requestsMap).toBeDefined();
    });
    it('should initialize each sections as a Set', () => {
      expect(requestsMap[routeMap.Issues].add.constructor).toBeDefined();
    });
    it('should have sections in the requests map', () => {
      expect(Object.keys(requestsMap)).toEqual([
        routeMap.AgileBoard,
        routeMap.Article,
        routeMap.Inbox,
        routeMap.Issue,
        routeMap.Issues,
        routeMap.KnowledgeBase,
      ]);
    });
  });
  let requestsMapIssues;
  let routeIdMock;
  let abortControllerMock;
  describe('Request Controller', () => {
    beforeEach(() => {
      routeIdMock = routeMap.Issues;
      abortControllerMock = {
        abort: jest.fn(),
      };
      requestController.init();
      requestsMapIssues = requestsMap[routeIdMock];
    });
    it('should add a request', () => {
      expect(requestsMapIssues.size).toEqual(0);
      requestController.add(routeIdMock, abortControllerMock);
      expect(requestsMapIssues.size).toEqual(1);
    });
    it('should remove a request', () => {
      requestController.add(routeIdMock, abortControllerMock);
      expect(requestsMapIssues.size).toEqual(1);
      requestController.delete(routeIdMock, abortControllerMock);
      expect(requestsMapIssues.size).toEqual(0);
    });
    it('should cancel and delete all Issues requests', () => {
      requestController.add(routeIdMock, abortControllerMock);
      requestController.add(routeIdMock, {...abortControllerMock});
      expect(requestsMapIssues.size).toEqual(2);
      requestController.cancelIssuesRequests();
      expect(abortControllerMock.abort).toHaveBeenCalledTimes(2);
      expect(requestsMapIssues.size).toEqual(0);
    });
  });
  describe('Fetch', () => {
    it('should', () => {
      global.fetch = jest.fn();
      const add = requestController.add;
      requestController.add = jest.fn();
      fetch2(
        'https://',
        {},
        {
          [routeIdMock]: {},
        },
      );
      expect(requestController.add).toHaveBeenCalled();
      requestController.add = add;
    });
  });
});
