
module.exports = {
    fillFieldHash: (issues = []) => {

        issues.forEach((issue) => {
            var fieldHash = {};

            (issue.field || []).forEach((field) => {
                var fieldName = field.name;
                fieldHash[fieldName] = field.value;
                for (var item in field) {
                    if (item !== 'value' && item !== 'name') {
                        fieldHash[fieldName][item] = field[item];
                    }
                }
            });

            issue.fieldHash = fieldHash;
        });

        return issues;
    },

    orderIssueFolders: (folders) => {
        var filters = {
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