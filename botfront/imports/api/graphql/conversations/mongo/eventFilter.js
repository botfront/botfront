const slotExistsQuery = slot => (
    { $and: [{ [`tracker.slots.${slot}`]: { $exists: true } }, { [`tracker.slots.${slot}`]: { $ne: null } }] }
);
const slotDoesNotExistQuery = slot => (
    { $or: [{ [`tracker.slots.${slot}`]: { $exists: false } }, { [`tracker.slots.${slot}`]: { $eq: null } }] }
);

export const categorizeEventFilters = events => (events || []).reduce((accumulator, event) => {
    const nextAccumulator = accumulator;
    switch (true) {
    // the slot check must be first as slot names might pass the other conditions
    case event.type === 'slot':
        if (event.excluded) nextAccumulator.excludedSlots.push(event.name);
        else nextAccumulator.includedSlots.push(event.name);
        break;
    case event.type === 'action':
        if (event.excluded) nextAccumulator.excludedActions.push(event.name);
        else nextAccumulator.includedActions.push(event.name);
        break;
    case event.type === 'intent':
        if (event.excluded) nextAccumulator.excludedIntents.push(event.name);
        else nextAccumulator.includedIntents.push(event.name);
        break;
    default: // if the event is not a slot or an action, it is an intent.
        break;
    }
    return nextAccumulator;
},
{
    includedIntents: [],
    excludedIntents: [],
    includedActions: [],
    excludedActions: [],
    includedSlots: [],
    excludedSlots: [],
});

export const createEventsStep = (
    {
        eventFilterOperator,
        eventFilter,
    },
    type,
) => {
    if (!eventFilter || eventFilter.length === 0 || eventFilterOperator === 'inOrder') {
        return {};
    }
    const filters = {};
    const {
        includedActions,
        excludedActions,
        includedIntents,
        excludedIntents,
        includedSlots,
        excludedSlots,
    } = categorizeEventFilters(eventFilter);
    if (eventFilter && eventFilter.length > 0) {
        if (eventFilterOperator === 'or') {
            filters.$or = [];
            if (includedActions.length > 0) {
                if (type === 'aggregation') filters.$or = filters.$or.concat(includedActions.map(action => ({ $in: [action, '$actions'] })));
                if (type === 'query') filters.$or.push({ actions: { $in: includedActions } });
            }
            if (includedIntents.length > 0) {
                if (type === 'aggregation') filters.$or = filters.$or.concat(includedIntents.map(intent => ({ $in: [intent, '$intents'] })));
                if (type === 'query') filters.$or.push({ intents: { $in: includedIntents } });
            }
            if (excludedActions.length > 0) {
                if (type === 'aggregation') filters.$or = filters.$or.concat(excludedActions.map(action => ({ $not: { $in: [action, '$actions'] } })));
                if (type === 'query') filters.$or.push({ actions: { $nin: excludedActions } });
            }
            if (excludedIntents.length > 0) {
                if (type === 'aggregation') filters.$or = filters.$or.concat(excludedIntents.map(intent => ({ $not: { $in: [intent, '$intents'] } })));
                if (type === 'query') filters.$or.push({ intents: { $nin: excludedIntents } });
            }
            if (includedSlots.length > 0) {
                if (type === 'aggregation') filters.$or = filters.$or.concat(includedSlots.map(slot => ({ $gt: [`$tracker.slots.${slot}`, null] })));
                if (type === 'query') filters.$or = filters.$or.concat(includedSlots.map(slot => slotExistsQuery(slot)));
            }
            if (excludedSlots.length > 0) {
                if (type === 'aggregation') filters.$or = filters.$or.concat(excludedSlots.map(slot => ({ $lte: [`$tracker.slots.${slot}`, null] })));
                if (type === 'query') filters.$or = filters.$or.concat(excludedSlots.map(slot => slotDoesNotExistQuery(slot)));
            }
        } else if (eventFilterOperator === 'and') {
            filters.$and = [];
            if (includedActions.length > 0) {
                if (type === 'aggregation') filters.$and = filters.$and.concat(includedActions.map(action => ({ $in: [action, '$actions'] })));
                if (type === 'query') filters.$and.push({ actions: { $all: includedActions } });
            }
            if (includedIntents.length > 0) {
                if (type === 'aggregation') filters.$and = filters.$and.concat(includedIntents.map(intent => ({ $in: [intent, '$intents'] })));
                if (type === 'query') filters.$and.push({ intents: { $all: includedIntents } });
            }
            if (includedSlots.length > 0) {
                if (type === 'aggregation') filters.$and = filters.$and.concat(includedSlots.map(slot => ({ $gt: [`$tracker.slots.${slot}`, null] })));
                if (type === 'query') filters.$and = filters.$and.concat(includedSlots.map(slot => slotExistsQuery(slot)));
            }
            if ((excludedIntents.length > 0 || excludedActions.length > 0) && type === 'query') {
                let exclusions = [];
                if (excludedActions.length > 0) {
                    exclusions = exclusions.concat(excludedActions.map(action => ({ $in: [action, '$actions'] })));
                }
                if (excludedIntents.length > 0) {
                    exclusions = exclusions.concat(excludedIntents.map(intent => ({ $in: [intent, '$intents'] })));
                }
                filters.$and.push({
                    $expr: {
                        $not: [
                            {
                                $or: exclusions,
                            },
                        ],
                    },
                });
            }
            if (excludedActions.length > 0 && type === 'aggregation') {
                filters.$and = filters.$and.concat(excludedActions.map(action => ({ $not: { $in: [action, '$actions'] } })));
            }
            if (excludedIntents.length > 0 && type === 'aggregation') {
                filters.$and = filters.$and.concat(excludedIntents.map(intent => ({ $not: { $in: [intent, '$intents'] } })));
            }
            if (excludedSlots.length > 0) {
                if (type === 'aggregation') filters.$and = filters.$and.concat(excludedSlots.map(slot => ({ $lte: [`$tracker.slots.${slot}`, null] })));
                if (type === 'query') filters.$and = filters.$and.concat(excludedSlots.map(slot => slotDoesNotExistQuery(slot)));
            }
        }
    }
    return filters;
};
