
module.exports = {
    fillFieldHash: (issues = []) => {

        issues.forEach((issue) => {
            var fieldHash = {};

            (issue.field || []).forEach((field) => {
                var fieldName = field.name.toLowerCase();
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
    }
};