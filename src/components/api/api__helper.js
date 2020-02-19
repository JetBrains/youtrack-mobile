/* @flow */
import {handleRelativeUrl} from '../config/config';
import objectWalk from 'object-walk';
import type {IssueOnList, AnyIssue, ServersideSuggestion, TransformedSuggestion} from '../../flow/Issue';

const API = {
  makeFieldHash: (issue: IssueOnList): Object => {
    const fieldHash = {};
    (issue.fields || []).forEach(field => {
      const fieldName = field.projectCustomField.field.name;
      fieldHash[fieldName] = field.value;
    });
    return fieldHash;
  },

  fillIssuesFieldHash: (issues: Array<IssueOnList> = []) => {
    issues.forEach(issue => issue.fieldHash = API.makeFieldHash(issue));
    return issues;
  },

  convertQueryAssistSuggestions: (suggestions: Array<ServersideSuggestion>): Array<TransformedSuggestion> => {
    return suggestions.map(suggestion => {
      return {
        prefix: suggestion.pre || '',
        option: suggestion.o || '',
        suffix: suggestion.suf || '',
        description: suggestion.hd || suggestion.d || '',
        matchingStart: suggestion.ms,
        matchingEnd: suggestion.me,
        caret: suggestion.cp,
        completionStart: suggestion.cs,
        completionEnd: suggestion.ce
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
        [urlField]: handleRelativeUrl(item[urlField], backendUrl)
      };
    });
  },

  //Ported from youtrack frontend
  toField: function toFieldConstructor(fields: Object|Array<string|Object>) {
    const toArray = function(object) {
      if (Array.isArray(object)) {
        return object;
      }

      return [object];
    };

    const toFieldString = function(fields: Array<any>) {
      return toArray(fields).map(function(field) {
        if (typeof field === 'string') {
          return field;
        }

        if (field.constructor === toFieldConstructor) {
          return field.toString();
        }

        if (Array.isArray(field)) {
          return toFieldString(field);
        }

        return Object.keys(field).map(function(key) {
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
      toString: function() {
        return fieldsString;
      }
    };
  },

  getIssueId(issue: AnyIssue) {
    return issue.idReadable ? issue.idReadable : issue.id;
  },

  patchAllRelativeAvatarUrls(data: Object, backendUrl: string) {
    //TODO: potentially slow place
    objectWalk(data, (value, propertyName, obj) => {
      if (typeof value === 'string' && value.indexOf('/hub/api/rest/avatar/') === 0) {
        obj[propertyName] = handleRelativeUrl(obj[propertyName], backendUrl);
      }
    });

    return data;
  },

  stripHtml(commandPreview: string) {
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

  }

};

export default API;
