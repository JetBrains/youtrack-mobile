let API = {
  fillFieldHashOldRest: (issue) => {
    let fieldHash = {};

    (issue.field || []).forEach((field) => {
      const fieldName = field.name;
      fieldHash[fieldName] = field.value;
      for (const item in field) {
        if (item !== 'value' && item !== 'name') {
          fieldHash[fieldName][item] = field[item];
        }
      }
    });

    issue.fieldHash = fieldHash;

    return issue;
  },

  makeFieldHash: (issue) => {
    let fieldHash = {};
    (issue.fields || []).forEach(field => {
      const fieldName = field.projectCustomField.field.name;
      fieldHash[fieldName] = field.value;
    });
    return fieldHash;
  },

  fillIssuesFieldHash: (issues = []) => {
    issues.forEach(issue => issue.fieldHash = API.makeFieldHash(issue));
    return issues;
  },

  //Ported from youtrack frontend
  toField: function toFieldConstructor(fields) {
    const toArray = function(object) {
      if (Array.isArray(object)) {
        return object;
      }

      return [object];
    };

    const toFieldString = function(fields) {
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

  projectFieldTypeToFieldType(projectType, isMultiple) {
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
      fieldType = fieldType.replace('Single', 'Multi')
    }
    return fieldType;
  }
};

module.exports = API;
