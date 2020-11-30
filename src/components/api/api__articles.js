/* @flow */

import ApiBase from './api__base';

import type {Article} from '../../flow/Article';


export default class ArticlesAPI extends ApiBase {

  get(query: string | null = null, $top: number = 100, $skip: number = 0): Promise<Article> {
    const fields: string = ApiBase.createFieldsQuery(
      ['id,summary,parentArticle(id),project(id,name),ordinal,hasUnpublishedChanges'],
      {
        ...{$top},
        ...{$skip},
        ...{query}
      }
    );
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles?${fields}`
    );
  }
}
