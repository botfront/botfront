export const getModelField = (fieldName, model) => {
    try {
        let field = model;
        fieldName.split('.').forEach((accessor) => { field = field[accessor]; });
        return field;
    } catch (err) {
        return undefined;
    }
};
