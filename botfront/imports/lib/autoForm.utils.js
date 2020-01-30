export const getModelField = (fieldName, model) => {
    try {
        let field = model;
        fieldName.split('.').forEach((accessor) => {
            if (typeof field !== 'object') {
                field = undefined;
                return;
            }
            field = field[accessor];
        });
        return field;
    } catch (err) {
        return undefined;
    }
};
