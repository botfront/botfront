export const createIntentsActionsStep = ({
    intentsActionsOperator,
    intentsActionsFilters,
}) => {
    if (!intentsActionsFilters || intentsActionsFilters.length === 0 || intentsActionsOperator === 'inOrder') {
        return {};
    }
    const filters = {};
    const included = intentsActionsFilters.filter(intentAction => !intentAction.excluded).map(intentAction => intentAction.name);
    const excluded = intentsActionsFilters.filter(intentAction => intentAction.excluded).map(intentAction => intentAction.name);

    const includedActions = included.filter(intentAction => intentAction.startsWith('utter_') || intentAction.startsWith('action_'));
    const excludedActions = excluded.filter(intentAction => intentAction.startsWith('utter_') || intentAction.startsWith('action_'));

    const includedIntents = included.filter(intentAction => !intentAction.startsWith('utter_') && !intentAction.startsWith('action_'));
    const excludedIntents = excluded.filter(intentAction => !intentAction.startsWith('utter_') && !intentAction.startsWith('action_'));
    if (intentsActionsFilters && intentsActionsFilters.length > 0) {
        if (intentsActionsOperator === 'or') {
            filters.$or = [];
            if (includedActions.length > 0) {
                filters.$or = filters.$or.concat(includedActions.map(intent => ({ $in: [intent, '$intents'] })));
            }
            if (includedIntents.length > 0) {
                filters.$or = filters.$or.concat(includedIntents.map(intent => ({ $in: [intent, '$intents'] })));
            }
            if (excludedActions.length > 0) {
                filters.$or = filters.$or.concat(excludedActions.map(intent => ({ $not: { $in: [intent, '$intents'] } })));
            }
            if (excludedIntents.length > 0) {
                filters.$or = filters.$or.concat(excludedIntents.map(intent => ({ $not: { $in: [intent, '$intents'] } })));
            }
        } else if (intentsActionsOperator === 'and') {
            filters.$and = [];
            if (includedActions.length > 0) {
                filters.$and = filters.$and.concat(includedActions.map(intent => ({ $in: [intent, '$intents'] })));
            }
            if (includedIntents.length > 0) {
                filters.$and = filters.$and.concat(includedIntents.map(intent => ({ $in: [intent, '$intents'] })));
            }
            if (excludedActions.length > 0) {
                filters.$and = filters.$and.concat(excludedActions.map(intent => ({ $not: { $in: [intent, '$intents'] } })));
            }
            if (excludedIntents.length > 0) {
                filters.$and = filters.$and.concat(excludedIntents.map(intent => ({ $not: { $in: [intent, '$intents'] } })));
            }
        }
    }
    return filters;
};
