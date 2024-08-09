import * as responsiveHelper from 'components/responsive/responsive-helper';
import Router from './router';
import {navigateToRouteById} from './router-helper';

jest.mock('components/router/router', () => ({
  Issue: jest.fn(),
  Issues: jest.fn(),
  Tickets: jest.fn(),
  ArticleSingle: jest.fn(),
  KnowledgeBase: jest.fn(),
}));

const entityId = 'ID-1';
const navigateToActivity = '#focus';

describe('Router', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('Split view', () => {
    beforeEach(() => {
      jest.spyOn(responsiveHelper, 'isSplitView').mockReturnValue(true);
    });

    it('should navigate to `Issues`', () => {
      const isRedirected = navigateToRouteById();

      expect(Router.Issues).toHaveBeenCalled();
      expect(isRedirected).toEqual(false);
    });

    it('should navigate to `Issues` with issue id', () => {
      const isRedirected = navigateToRouteById(entityId, undefined, undefined);

      expect(Router.Issues).toHaveBeenCalledWith({issueId: entityId});
      expect(isRedirected).toEqual(true);
    });

    it('should navigate to `Issues` with issue id and activity param', () => {
      const isRedirected = navigateToRouteById(entityId, undefined, navigateToActivity);

      expect(Router.Issues).toHaveBeenCalledWith({issueId: entityId, navigateToActivity});
      expect(isRedirected).toEqual(true);
    });

    it('should navigate to `Tickets` with issue id', () => {
      const isRedirected = navigateToRouteById(entityId, undefined, undefined, true);

      expect(Router.Tickets).toHaveBeenCalledWith({issueId: entityId});
      expect(isRedirected).toEqual(true);
    });

    it('should navigate to `Tickets` with issue id and activity param', () => {
      const isRedirected = navigateToRouteById(entityId, undefined, navigateToActivity, true);

      expect(Router.Tickets).toHaveBeenCalledWith({issueId: entityId, navigateToActivity});
      expect(isRedirected).toEqual(true);
    });

    it('should navigate to `KnowledgeBase` with article id', () => {
      const isRedirected = navigateToRouteById(undefined, entityId, undefined, true);

      expect(Router.KnowledgeBase).toHaveBeenCalledWith({lastVisitedArticle: {id: entityId}});
      expect(isRedirected).toEqual(true);
    });

    it('should navigate to `KnowledgeBase` with article id and activity param', () => {
      const isRedirected = navigateToRouteById(undefined, entityId, navigateToActivity, true);

      expect(Router.KnowledgeBase).toHaveBeenCalledWith({lastVisitedArticle: {id: entityId}, navigateToActivity});
      expect(isRedirected).toEqual(true);
    });
  });


  describe('Normal view', () => {
    beforeEach(() => {
      jest.spyOn(responsiveHelper, 'isSplitView').mockReturnValue(false);
    });

    it('should navigate to `Issues`', () => {
      const isRedirected = navigateToRouteById();

      expect(Router.Issues).toHaveBeenCalled();
      expect(isRedirected).toEqual(false);
    });

    it('should navigate to `Issue` with issue id', () => {
      const isRedirected = navigateToRouteById(entityId, undefined, undefined);

      expect(Router.Issue).toHaveBeenCalledWith({issueId: entityId}, {forceReset: true});
      expect(isRedirected).toEqual(true);
    });

    it('should navigate to `Issue` with issue id and activity param', () => {
      const isRedirected = navigateToRouteById(entityId, undefined, navigateToActivity);

      expect(Router.Issue).toHaveBeenCalledWith({issueId: entityId, navigateToActivity}, {forceReset: true});
      expect(isRedirected).toEqual(true);
    });

    it('should navigate to `Tickets` with issue id', () => {
      const isRedirected = navigateToRouteById(entityId, undefined, undefined, true);

      expect(Router.Issue).toHaveBeenCalledWith({issueId: entityId}, {forceReset: true});
      expect(isRedirected).toEqual(true);
    });

    it('should navigate to `Tickets` with issue id and activity param', () => {
      const isRedirected = navigateToRouteById(entityId, undefined, navigateToActivity, true);

      expect(Router.Issue).toHaveBeenCalledWith({issueId: entityId, navigateToActivity}, {forceReset: true});
      expect(isRedirected).toEqual(true);
    });

    it('should navigate to `ArticleSingle` with article id', () => {
      const isRedirected = navigateToRouteById(undefined, entityId, undefined, true);

      expect(Router.ArticleSingle).toHaveBeenCalledWith({articlePlaceholder: {id: entityId}}, {forceReset: true});
      expect(isRedirected).toEqual(true);
    });

    it('should navigate to `ArticleSingle` with article id and activity param', () => {
      const isRedirected = navigateToRouteById(undefined, entityId, navigateToActivity);

      expect(Router.ArticleSingle).toHaveBeenCalledWith({articlePlaceholder: {id: entityId}, navigateToActivity}, {forceReset: true});
      expect(isRedirected).toEqual(true);
    });
  });
});
