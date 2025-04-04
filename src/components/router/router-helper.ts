import Router from 'components/router/router';
import {isSplitView} from 'components/responsive/responsive-helper';

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
      if (issueId) {
        Router.Issue({issueId, navigateToActivity}, {forceReset: true});
      }
      if (articleId) {
        Router.ArticleSingle({articlePlaceholder: {id: articleId}, navigateToActivity}, {forceReset: true});
      }
    }
  }
  return hasEntity;
};

export {
  navigateToRouteById,
};

