/* @flow */
import {handleRelativeUrl} from '../config/config';
import objectWalk from 'object-walk';
import type {IssueOnList, AnyIssue, ServersideSuggestion, TransformedSuggestion} from '../../flow/Issue';
import ResourceTypes from './api__resource-types';

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

  convertRelativeUrls: (items: Array<Object> = [], urlField: string, backendUrl: string) => {
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
  toField: function toFieldConstructor(fields: Array<string|Object>) {
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

  projectFieldTypeToFieldType(projectType: string, isMultiple: boolean) {
    const map = {
      'jetbrains.charisma.customfields.complex.user.UserProjectCustomField' : 'jetbrains.charisma.customfields.complex.user.SingleUserIssueCustomField',
      'jetbrains.charisma.customfields.complex.version.VersionProjectCustomField' : 'jetbrains.charisma.customfields.complex.version.SingleVersionIssueCustomField',
      'jetbrains.charisma.customfields.complex.state.StateProjectCustomField' : 'jetbrains.charisma.customfields.complex.state.StateIssueCustomField',
      'jetbrains.charisma.customfields.complex.ownedField.OwnedProjectCustomField' : 'jetbrains.charisma.customfields.complex.ownedField.SingleOwnedIssueCustomField',
      'jetbrains.charisma.customfields.complex.group.GroupProjectCustomField' : 'jetbrains.charisma.customfields.complex.group.SingleGroupIssueCustomField',
      'jetbrains.charisma.customfields.complex.enumeration.EnumProjectCustomField' : 'jetbrains.charisma.customfields.complex.enumeration.SingleEnumIssueCustomField',
      'jetbrains.charisma.customfields.complex.build.BuildProjectCustomField' : 'jetbrains.charisma.customfields.complex.build.SingleBuildIssueCustomField'
    };
    let fieldType = map[projectType];

    if (isMultiple) {
      fieldType = fieldType.replace('Single', 'Multi');
    }
    return fieldType;
  },

  getIssueId(issue: AnyIssue) {
    return `${issue.project.shortName}-${issue.numberInProject}`;
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

  removeDuplicatesByPropName(items: Array<Object>, valueName: string) {
    if (!valueName) {
      return items;
    }

    return (items || []).filter((item, index, it) =>
      index === it.findIndex(i => i[valueName] === item[valueName])
    );
  },

  isSecured(entity: Object) {
    if (!entity || !entity.visibility) {
      return false;
    }

    const visibility = entity.visibility;
    if (hasLimitedVisibility(visibility)) {
      return true;
    }

    return !!(
      (visibility.permittedUsers && visibility.permittedUsers.length) ||
      (visibility.permittedGroups && visibility.permittedGroups.length)
    );

    function hasLimitedVisibility(visibility: Object) {
      return visibility && visibility.$type && visibility.$type === ResourceTypes.VISIBILITY_LIMITED;
    }
  },

  getEntityPresentation(item: Object) {
    if (!item) {
      return '';
    }

    return item.fullName || item.name || item.login || item.presentation || '';
  },

  getVisibilityPresentation(entity: Object) {
    if (!entity) {
      return null;
    }

    const visibility = entity.visibility || {};
    return (
      [].concat(visibility.permittedGroups || [])
        .concat(visibility.permittedUsers || [])
        .map(it => API.getEntityPresentation(it))
        .join(', ')
    );
  },

};

export default API;
