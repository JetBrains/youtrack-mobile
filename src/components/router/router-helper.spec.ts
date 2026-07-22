import * as responsiveHelper from 'components/responsive/responsive-helper';
import Router from './router';
import {navigateToRouteById} from './router-helper';

jest.mock('components/router/router', () => ({
  Issue: jest.fn(),
  Issues: jest.fn(),
  Tickets: jest.fn(),
  ArticleSingle: jest.fn(),
  KnowledgeBase: jest.fn(),
  resetWithRoot: jest.fn(),
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

    it('should reset to `[Issues, Issue]` with issue id', () => {
      const isRedirected = navigateToRouteById(entityId, undefined, undefined);

      expect(Router.resetWithRoot).toHaveBeenCalledWith('Issues', 'Issue', {
        issueId: entityId,
        issuePlaceholder: {id: entityId},
        navigateToActivity: undefined,
      });
      expect(isRedirected).toEqual(true);
    });

    it('should reset to `[Issues, Issue]` with issue id and activity param', () => {
      const isRedirected = navigateToRouteById(entityId, undefined, navigateToActivity);

      expect(Router.resetWithRoot).toHaveBeenCalledWith('Issues', 'Issue', {
        issueId: entityId,
        issuePlaceholder: {id: entityId},
        navigateToActivity,
      });
      expect(isRedirected).toEqual(true);
    });

    it('should reset to `[Tickets, Issue]` with issue id for a reporter', () => {
      const isRedirected = navigateToRouteById(entityId, undefined, undefined, true);

      expect(Router.resetWithRoot).toHaveBeenCalledWith('Tickets', 'Issue', {
        issueId: entityId,
        issuePlaceholder: {id: entityId},
        navigateToActivity: undefined,
      });
      expect(isRedirected).toEqual(true);
    });

    it('should reset to `[Tickets, Issue]` with issue id and activity param for a reporter', () => {
      const isRedirected = navigateToRouteById(entityId, undefined, navigateToActivity, true);

      expect(Router.resetWithRoot).toHaveBeenCalledWith('Tickets', 'Issue', {
        issueId: entityId,
        issuePlaceholder: {id: entityId},
        navigateToActivity,
      });
      expect(isRedirected).toEqual(true);
    });

    it('should reset to `[KnowledgeBase, Article]` with article id (reporter root ignored for articles)', () => {
      const isRedirected = navigateToRouteById(undefined, entityId, undefined, true);

      expect(Router.resetWithRoot).toHaveBeenCalledWith('KnowledgeBase', 'Article', {
        articlePlaceholder: {id: entityId},
        navigateToActivity: undefined,
      });
      expect(isRedirected).toEqual(true);
    });

    it('should reset to `[KnowledgeBase, Article]` with article id and activity param', () => {
      const isRedirected = navigateToRouteById(undefined, entityId, navigateToActivity);

      expect(Router.resetWithRoot).toHaveBeenCalledWith('KnowledgeBase', 'Article', {
        articlePlaceholder: {id: entityId},
        navigateToActivity,
      });
      expect(isRedirected).toEqual(true);
    });
  });
});
