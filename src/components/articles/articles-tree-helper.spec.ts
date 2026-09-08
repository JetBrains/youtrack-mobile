import {createBreadCrumbs} from './articles-tree-helper';

import type {
  Article,
  ArticleNode,
  ArticleProject,
  ArticlesList,
} from 'types/Article';

const project = ({
  id: 'JT',
  $type: 'jetbrains.charisma.persistent.Project',
  articles: {collapsed: false},
} as unknown) as ArticleProject;

const createArticle = (id: string, parentId?: string): Article =>
  (({
    id,
    project,
    parentArticle: parentId ? {id: parentId} : undefined,
  } as unknown) as Article);

const createNode = (article: Article): ArticleNode =>
  (({data: article, children: []} as unknown) as ArticleNode);

const createList = (articles: Article[]): ArticlesList =>
  (([
    {title: project, data: articles.map(createNode), dataCollapsed: null},
  ] as unknown) as ArticlesList);

describe('createBreadCrumbs', () => {
  it('should build the breadcrumbs chain from the loaded tree', () => {
    const grandParent = createArticle('JT-A-1');
    const parent = createArticle('JT-A-2', 'JT-A-1');
    const article = createArticle('JT-A-3', 'JT-A-2');

    const breadCrumbs = createBreadCrumbs(
      article,
      createList([grandParent, parent, article]),
    );

    expect(breadCrumbs.map((it: any) => it.id)).toEqual([
      'JT',
      'JT-A-1',
      'JT-A-2',
    ]);
  });

  it('should terminate when the parent article is missing from the loaded tree', () => {
    // Regression: JT-A-365 -> parent JT-A-271, but the ancestor is not present
    // in the tree loaded for the project (deep sub-article navigation).
    const article = createArticle('JT-A-365', 'JT-A-271');

    const breadCrumbs = createBreadCrumbs(article, createList([article]));

    expect(breadCrumbs.map((it: any) => it.id)).toEqual(['JT']);
  });

  it('should terminate on a cyclic parent chain', () => {
    const a = createArticle('JT-A-1', 'JT-A-2');
    const b = createArticle('JT-A-2', 'JT-A-1');

    const breadCrumbs = createBreadCrumbs(a, createList([a, b]));

    expect(breadCrumbs.map((it: any) => it.id)).toEqual(['JT', 'JT-A-1', 'JT-A-2']);
  });
});
