import Router from 'components/router/router';
import {isSplitView} from 'components/responsive/responsive-helper';


const navigateToRouteById = (issueId?: string, articleId?: string, navigateToActivity?: string, isReporter?: boolean) => {
  const defaultRoute = isReporter ? Router.Tickets : Router.Issues;
  if (isSplitView()) {
    if (!issueId && !articleId) {
      defaultRoute();
    } else {
      if (issueId) {
        defaultRoute({issueId, navigateToActivity});
      }
      if (articleId) {
        Router.KnowledgeBase({lastVisitedArticle: {id: articleId}, navigateToActivity});
      }
    }
  } else {
    if (!issueId && !articleId) {
      defaultRoute();
    } else {
      if (issueId) {
        Router.Issue({issueId, navigateToActivity}, {forceReset: true});
      }
      if (articleId) {
        Router.ArticleSingle({articlePlaceholder: {id: articleId}, navigateToActivity}, {forceReset: true});
      }
    }
  }
};

export {
  navigateToRouteById,
};

