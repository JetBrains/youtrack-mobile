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
    }
};

module.exports = API;