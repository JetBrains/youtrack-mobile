import objectWalk from 'object-walk';
import {getReadableID} from '../issue-formatter/issue-formatter';
import {handleRelativeUrl} from '../config/config';
import {toField} from 'util/to-field';
import {ICustomFieldValue} from 'types/CustomFields';
import {
  AnyIssue,
  ServersideSuggestion,
  TransformedSuggestion,
  ServersideSuggestionLegacy,
  ListIssue,
  ListIssueField,
  ListIssueFieldValue,
  IssueOnList,
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
    attachments: Array<Record<string, any>>,
    backendUrl: string,
  ): Array<Record<string, any>> {
    let convertedItems = attachments;
    ['url', 'thumbnailURL', 'avatarUrl'].forEach((fieldName: string) => {
      convertedItems = this.convertRelativeUrls(
        convertedItems,
        fieldName,
        backendUrl,
      );
    });
    return convertedItems;
  },

  toField: toField,

  getIssueId(issue: AnyIssue): string {
    return getReadableID(issue);
  },

  patchAllRelativeAvatarUrls(
    data: Record<string, any>,
    backendUrl: string,
  ): any {
    //TODO: potentially slow place
    objectWalk(data, (value, propertyName, obj) => {
      if (
        typeof value === 'string' &&
        value.indexOf('/hub/api/rest/avatar/') === 0
      ) {
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
  ): Array<Record<string, any>> {
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
      _a.length === _b.length && _a.every((value, index) => value === _b[index])
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
