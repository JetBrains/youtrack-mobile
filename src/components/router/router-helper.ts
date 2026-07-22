import Router from 'components/router/router';
import {isSplitView} from 'components/responsive/responsive-helper';
import {routeMap} from 'app-routes';

const getDefaultRootRoute = (isReporter?: boolean): string =>
  isReporter ? routeMap.Tickets : routeMap.Issues;

const navigateToRouteById = (
  issueId?: string,
  articleId?: string,
  navigateToActivity?: string,
  isReporter?: boolean
): boolean => {
  const defaultRoute = isReporter ? Router.Tickets : Router.Issues;
  const hasEntity = !!(issueId || articleId);
  if (!hasEntity) {
    defaultRoute();
  } else {
    if (isSplitView()) {
      if (issueId) {
        defaultRoute({issueId, navigateToActivity});
      }
      if (articleId) {
        Router.KnowledgeBase({lastVisitedArticle: {id: articleId}, navigateToActivity});
      }
    } else {
      const root = getDefaultRootRoute(isReporter);
      if (issueId) {
        Router.resetWithRoot(root, routeMap.Issue, {
          issueId,
          issuePlaceholder: {id: issueId},
          navigateToActivity,
        });
      }
      if (articleId) {
        // Articles go back to their natural home, the Knowledge Base, not the
        // issue/ticket list.
        Router.resetWithRoot(routeMap.KnowledgeBase, routeMap.Article, {
          articlePlaceholder: {id: articleId},
          navigateToActivity,
        });
      }
    }
  }
  return hasEntity;
};

export {
  getDefaultRootRoute,
  navigateToRouteById,
};

