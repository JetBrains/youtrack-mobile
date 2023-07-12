import Router from 'components/router/router';
import {isSplitView} from 'components/responsive/responsive-helper';


const navigateToRouteById = (issueId?: string, articleId?: string, navigateToActivity?: string) => {
  if (isSplitView()) {
    if (!issueId && !articleId) {
      Router.Issues();
    } else {
      if (issueId) {
        Router.Issues({issueId, navigateToActivity});
      }
      if (articleId) {
        Router.KnowledgeBase({lastVisitedArticle: {id: articleId}, navigateToActivity});
      }
    }
  } else {
    if (!issueId && !articleId) {
      Router.Issues({issueId});
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

