import type {IssueProject} from './CustomFields';

export type Article = {
  id: string,
  idReadable: string,
  summary: string,
  project: IssueProject,
  parentArticle: {
    id: string
  }
}

export type ArticleTreeItem = {
  data: Article & { parentId: string | null },
  children: Array<Article>
}

export type ArticleTree = Array<ArticleTreeItem>;
