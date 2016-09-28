/* @flow */

const API = {
  makeFieldHash: (issue: IssueOnList) => {
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
  }
};

module.exports = API;
