let API = {
  fillFieldHash: (issue) => {
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

  fillIssuesFieldHash: (issues = []) => {
    issues.forEach(issue => API.fillFieldHash(issue));
    return issues;
  },

  orderIssueFolders: (folders) => {
    const filters = {
      isSavedSearch: function (folder) {
        return folder.fqFolderId.indexOf('$s$') === 0;
      },
      isTag: function (folder) {
        return folder.fqFolderId.indexOf('$t$') === 0;
      },
      isProject: function (folder) {
        return !filters.isSavedSearch(folder) && !filters.isTag(folder);
      }
    };

    return (folders || {}).sort((folder) => {
      //TODO
    });
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
          var value = field[key];

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
  }
};

module.exports = API;
