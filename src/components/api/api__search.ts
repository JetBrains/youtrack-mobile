import qs from 'qs';
import ApiBase from './api__base';
import ApiHelper from './api__helper';
import type Auth from '../auth/oauth2';
import type {Folder} from 'types/User';
import type {
  ServersideSuggestion,
  ServersideSuggestionLegacy,
  TransformedSuggestion,
} from 'types/Issue';
import {QueryAssistAst} from 'components/query-assist/query-parser_types';


export default class SearchAPI extends ApiBase {
  constructor(auth: Auth) {
    super(auth);
  }

  async getSearchSuggestions(
    payload: Record<string, any> | null | undefined = null,
  ): Promise<any> {
    const queryString: string = ApiBase.createFieldsQuery(
      {
        query: '',
        sortProperties: [
          '$type',
          'id',
          'asc',
          'readOnly',
          'localizedName',
          {
            sortField: [
              '$type',
              'id',
              'localizedName',
              'name',
              'defaultSortAsc',
              'sortablePresentation',
            ],
          },
          {
            folder: ['id'],
          },
        ],
      },
      null,
      {
        encode: false,
      },
    );
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/search/assist/?${queryString}`,
      'POST',
      payload,
    );
  }

  async getQueryAssistSuggestions(
    query: string,
    caret: number,
    folders: Folder[] | null = null,
  ): Promise<Array<TransformedSuggestion>> {
    const response: {
      suggestions: ServersideSuggestion[];
    } = await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/search/assist?fields=caret,query,suggestions(auxiliaryIcon,caret,className,completionEnd,completionStart,description,group,icon,matchingEnd,matchingStart,option,prefix,suffix)`,
      'POST',
      {
        caret,
        folders,
        query,
      },
    );
    return ApiHelper.convertQueryAssistSuggestions(response.suggestions);
  }

  async getQueryAssistSuggestionsData(
    query: string,
    folders: Folder[] | null = [],
    type: string = 'Issue',
  ): Promise<{
    ast: QueryAssistAst,
    caret: number,
    query: string,
  }> {
    const params = 'fields=title,caret,query,ast(expression(%40exp))%3B%40exp%3A%24type,operator,left(%40exp),right(%40exp),terms(text,start,stop,minus,value%2Fname,fields(field(name),minus),%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20value(name),field(name,start,stop,filterFields(%24type,id,customField(id,name))),values(%24type,start,stop,minus,value(name,minus),left(name),right(name),expression(%40exp)))';
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/search/assist?${params}`,
      'POST',
      {
        caret: 0,
        folders,
        query,
        type,
      },
    );
  }

  async getQueryAssistSuggestionsLegacy(
    query: string,
    caret: number,
  ): Promise<Array<TransformedSuggestion>> {
    const queryString = qs.stringify({
      query,
      caret,
    });
    const response: {
      suggest: {
        items: ServersideSuggestionLegacy[];
      };
    } = await this.makeAuthorizedRequest(
      `${this.youTrackUrl}/rest/search/underlineAndSuggest?${queryString}`,
    );
    return ApiHelper.convertQueryAssistSuggestionsLegacy(
      response.suggest.items,
    );
  }
}
