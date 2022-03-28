/* @flow */

import {handleRelativeUrl} from '../config/config';
import objectWalk from 'object-walk';
import {getReadableID} from '../issue-formatter/issue-formatter';

import type {Attachment, CustomField} from 'flow/CustomFields';
import type {
  AnyIssue,
  ServersideSuggestion,
  TransformedSuggestion,
  ServersideSuggestionLegacy,
} from 'flow/Issue';

const API = {
  makeFieldHash: (issue: AnyIssue): Object => {
    const fieldHash: $Shape<{ key: string, value: CustomField }> = {};
    (issue.fields || []).forEach((field: CustomField) => {
      const _field: CustomField = field.projectCustomField.field;
      const fieldName: string = _field.localizedName || _field.name;
      fieldHash[fieldName] = field.value;
    });
    return fieldHash;
  },

  fillIssuesFieldHash: (issues: Array<AnyIssue> = []): Array<AnyIssue> => {
    issues.forEach((issue: AnyIssue) => {issue.fieldHash = API.makeFieldHash(issue);});
    return issues;
  },

  convertQueryAssistSuggestions: (suggestions: Array<ServersideSuggestion>): Array<TransformedSuggestion> => {
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

  convertQueryAssistSuggestionsLegacy: (suggestions: Array<ServersideSuggestionLegacy>): Array<TransformedSuggestion> => {
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

  convertRelativeUrls: (items: Array<Object> = [], urlField: string, backendUrl: string): Array<Object> => {
    return items.map(item => {
      if (!item[urlField]) {
        return item;
      }
      return {
        ...item,
        [urlField]: handleRelativeUrl(item[urlField], backendUrl),
      };
    });
  },

  convertAttachmentRelativeToAbsURLs(attachments: Array<Attachment>, backendUrl: string): Array<Attachment> {
    let convertedItems: Array<Attachment> = attachments;
    ['url', 'thumbnailURL'].forEach(
      (fieldName: string) => {convertedItems = this.convertRelativeUrls(convertedItems, fieldName, backendUrl);}
    );
    return convertedItems;
  },

  //Ported from youtrack frontend
  toField: function toFieldConstructor(fields: Object | Array<string | Object>): {
    constructor: Function,
    toString: Function
  } {
    const toArray = function (object) {
      if (Array.isArray(object)) {
        return object;
      }

      return [object];
    };

    const toFieldString = function (fields: Array<any>) {
      return toArray(fields).map(function (field) {
        if (typeof field === 'string') {
          return field;
        }

        if (field.constructor === toFieldConstructor) {
          return field.toString();
        }

        if (Array.isArray(field)) {
          return toFieldString(field);
        }

        return Object.keys(field).map(function (key) {
          const value = field[key];

          if (value) {
            return `${key}(${toFieldString(value)})`;
          }

          return key;
        });
      }).join(',');
    };

    const fieldsString = toFieldString(fields);

    return {
      constructor: toFieldConstructor,
      toString: function () {
        return fieldsString;
      },
    };
  },

  getIssueId(issue: AnyIssue): string {
    return getReadableID(issue);
  },

  patchAllRelativeAvatarUrls(data: Object, backendUrl: string): any {
    //TODO: potentially slow place
    objectWalk(data, (value, propertyName, obj) => {
      if (typeof value === 'string' && value.indexOf('/hub/api/rest/avatar/') === 0) {
        obj[propertyName] = handleRelativeUrl(obj[propertyName], backendUrl);
      }
    });

    return data;
  },

  stripHtml(commandPreview: string): string {
    return commandPreview.replace(/<\/?[^>]+(>|$)/g, '');
  },

  removeDuplicatesByPropName(items: Array<Object>, valueName: string): Array<Object> {
    if (!valueName) {
      return items;
    }

    return (items || []).filter((item, index, it) =>
      index === it.findIndex(i => i[valueName] === item[valueName])
    );
  },

  equalsByProp(a: Array<Object>, b: Array<Object>, propName: string): boolean {
    const _a = a.reduce((keys, it) => keys.concat(it[propName]), []);
    const _b = b.reduce((keys, it) => keys.concat(it[propName]), []);

    return _a.length === _b.length && _a.every((value, index) => value === _b[index]);

  },

};

export default API;
