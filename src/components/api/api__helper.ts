// @ts-ignore
import objectWalk from 'object-walk';

import {getReadableID} from 'components/issue-formatter/issue-formatter';
import {handleRelativeUrl} from 'components/config/config';
import {toField} from 'util/to-field';

import {CustomFieldBase, ICustomFieldValue} from 'types/CustomFields';
import {
  ServersideSuggestion,
  TransformedSuggestion,
  ServersideSuggestionLegacy,
  IssueOnList,
  IssueOnListExtended,
  IssueFull,
  IssueFieldHash,
  BaseIssue,
} from 'types/Issue';

interface Entity {
  [key: string]: any;
}

const API = {
  makeFieldHash: <T extends {fields: (IssueOnList | BaseIssue)['fields']}>(issue: T): IssueFieldHash => {
    const fieldHash = {} as IssueFieldHash;
    issue.fields.forEach(field => {
      const f: ICustomFieldValue | CustomFieldBase = field.projectCustomField.field;
      fieldHash[f.localizedName || f.name] = field.value;
    });
    return fieldHash;
  },
  fillIssuesFieldHash: <T extends IssueOnList>(issues: T[] = []): Array<T & {fieldHash: IssueFieldHash}> => {
    return issues.map(i => ({...i, fieldHash: API.makeFieldHash(i)}));
  },
  convertQueryAssistSuggestions: (suggestions: ServersideSuggestion[]): TransformedSuggestion[] => {
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
  convertQueryAssistSuggestionsLegacy: (suggestions: ServersideSuggestionLegacy[]): TransformedSuggestion[] => {
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
  convertRelativeUrls: <T extends Entity>(items: Array<T> = [], urlField: string, backendUrl: string): Array<T> => {
    return items.map(item => convertRelativeUrl<T>(item, urlField, backendUrl));
  },

  convertAttachmentRelativeToAbsURLs<T extends Entity>(items: T[], backendUrl: string): Array<T> {
    let convertedItems = items;
    ['url', 'thumbnailURL', 'avatarUrl'].forEach((fieldName: string) => {
      convertedItems = this.convertRelativeUrls<T>(convertedItems, fieldName, backendUrl);
    });
    return convertedItems;
  },

  toField: toField,

  getIssueId(issue: IssueOnListExtended | IssueFull): string {
    return getReadableID(issue);
  },

  patchAllRelativeAvatarUrls<T>(data: T, backendUrl: string): T {
    //TODO: potentially slow place
    objectWalk(data, (value: string | T, propertyName: string, obj: Entity) => {
      if (
        typeof value === 'string' &&
        (value.indexOf('/hub/api/rest/avatar/') === 0 || value.indexOf('/api/files/') === 0)
      ) {
        obj[propertyName] = handleRelativeUrl(obj[propertyName], backendUrl);
      }
    });
    return data;
  },

  stripHtml(commandPreview: string): string {
    return commandPreview.replace(/<\/?[^>]+(>|$)/g, '');
  },

  removeDuplicatesByPropName(items: Array<Record<string, any>>, valueName: string) {
    if (!valueName) {
      return items;
    }

    return (items || []).filter((item, index, it) => index === it.findIndex(i => i[valueName] === item[valueName]));
  },
};
export default API;

function convertRelativeUrl<T extends Entity>(item: T, urlField: string, backendUrl: string) {
  if (!item || !item[urlField]) {
    return item;
  }

  return {...item, [urlField]: handleRelativeUrl(item[urlField], backendUrl)};
}
