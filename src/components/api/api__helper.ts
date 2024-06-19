import objectWalk from 'object-walk';
import {getReadableID} from 'components/issue-formatter/issue-formatter';
import {handleRelativeUrl} from 'components/config/config';
import {toField} from 'util/to-field';

import type {Attachment, ICustomFieldValue} from 'types/CustomFields';
import type {
  ServersideSuggestion,
  TransformedSuggestion,
  ServersideSuggestionLegacy,
  ListIssue,
  ListIssueField,
  ListIssueFieldValue,
  IssueOnList,
  IssueFull,
} from 'types/Issue';

const API = {
  makeFieldHash: (issue: ListIssue): Record<string, any> => {
    const fieldHash: {[key: string]: ListIssueFieldValue} = {};
    issue.fields.forEach((field: ListIssueField) => {
      const f: ICustomFieldValue = field.projectCustomField.field;
      fieldHash[f.localizedName || f.name] = field.value;
    });
    return fieldHash;
  },
  fillIssuesFieldHash: (issues: ListIssue[] = []) => {
    return issues.map(i => ({...i, fieldHash: API.makeFieldHash(i)})) as IssueOnList[];
  },
  convertQueryAssistSuggestions: (
    suggestions: ServersideSuggestion[],
  ): TransformedSuggestion[] => {
    return suggestions.map((suggestion: ServersideSuggestion) => {
      return {
        prefix: suggestion.prefix || '',
        option: suggestion.option || '',
        suffix: suggestion.suffix || '',
        description: suggestion.description || '',
        matchingStart: suggestion.matchingStart,
        matchingEnd: suggestion.matchingEnd,
        caret: suggestion.caret,
        completionStart: suggestion.completionStart,
        completionEnd: suggestion.completionEnd,
      };
    });
  },
  convertQueryAssistSuggestionsLegacy: (
    suggestions: ServersideSuggestionLegacy[],
  ): TransformedSuggestion[] => {
    return suggestions.map((suggestion: ServersideSuggestionLegacy) => {
      return {
        prefix: suggestion.pre || '',
        option: suggestion.o || '',
        suffix: suggestion.suf || '',
        description: suggestion.hd || suggestion.d || '',
        matchingStart: suggestion.ms,
        matchingEnd: suggestion.me,
        caret: suggestion.cp,
        completionStart: suggestion.cs,
        completionEnd: suggestion.ce,
      };
    });
  },
  convertRelativeUrl: convertRelativeUrl,
  convertRelativeUrls: (
    items: Array<Record<string, any>> = [],
    urlField: string,
    backendUrl: string,
  ): Array<Record<string, any>> => {
    return items.map(item => convertRelativeUrl(item, urlField, backendUrl));
  },

  convertAttachmentRelativeToAbsURLs(
    attachments: Attachment[],
    backendUrl: string,
  ): Array<Attachment> {
    let convertedItems = attachments;
    ['url', 'thumbnailURL', 'avatarUrl'].forEach((fieldName: string) => {
      convertedItems = this.convertRelativeUrls(
        convertedItems,
        fieldName,
        backendUrl,
      ) as Attachment[];
    });
    return convertedItems;
  },

  toField: toField,

  getIssueId(issue: IssueOnList | IssueFull): string {
    return getReadableID(issue);
  },

  patchAllRelativeAvatarUrls(data: Record<string, any>, backendUrl: string) {
    //TODO: potentially slow place
    objectWalk(data, (value: string | Record<string, any>, propertyName: string, obj: Record<string, any>) => {
      if (typeof value === 'string' && value.indexOf('/hub/api/rest/avatar/') === 0) {
        obj[propertyName] = handleRelativeUrl(obj[propertyName], backendUrl);
      }
    });
    return data;
  },

  stripHtml(commandPreview: string): string {
    return commandPreview.replace(/<\/?[^>]+(>|$)/g, '');
  },

  removeDuplicatesByPropName(
    items: Array<Record<string, any>>,
    valueName: string,
  ) {
    if (!valueName) {
      return items;
    }

    return (items || []).filter(
      (item, index, it) =>
        index === it.findIndex(i => i[valueName] === item[valueName]),
    );
  },

  equalsByProp(
    a: Array<Record<string, any>>,
    b: Array<Record<string, any>>,
    propName: string,
  ): boolean {
    const _a = a.reduce((keys, it) => keys.concat(it[propName]), []);

    const _b = b.reduce((keys, it) => keys.concat(it[propName]), []);

    return (
      _a.length === _b.length && _a.every((value: Record<string, any>, index: number) => value === _b[index])
    );
  },
};
export default API;

function convertRelativeUrl(
  item: Record<string, any>,
  urlField: string,
  backendUrl: string,
) {
  if (!item || !item[urlField]) {
    return item;
  }

  return {...item, [urlField]: handleRelativeUrl(item[urlField], backendUrl)};
}
