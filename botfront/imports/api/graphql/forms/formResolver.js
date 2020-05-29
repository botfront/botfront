export default {
    Query: {},
    Mutation: {
        submitForm: async (_root, args) => {
            const { projectId, environment, tracker } = args;
            return { success: true };
        },
    },
    Form: {
        name: ({ name }) => name,
        slots: ({ slots }) => slots,
        collect_in_botfront: ({ collect_in_botfront: cib }) => cib,
        utter_on_submit: ({ utter_on_submit: uos }) => uos,
    },
    SlotToFill: {
        name: ({ name }) => name,
        filling: ({ filling }) => filling,
        validation: ({ validation }) => validation,
        utter_on_new_valid_slot: ({ utter_on_new_valid_slot: uonvs }) => uonvs,
    },
    SlotValidation: {
        operator: ({ operator }) => operator,
        comparatum: ({ comparatum }) => comparatum,
    },
    SlotFilling: {
        __resolveType: () => {},
        type: ({ type }) => type,
    },
    SlotFillingFromEntity: {
        type: ({ type }) => type,
        entity: ({ entity }) => entity,
        intent: ({ intent }) => intent,
        not_intent: ({ not_intent: notIntent }) => notIntent,
    },
    SlotFillingFromIntent: {
        type: ({ type }) => type,
        value: ({ value }) => value,
        intent: ({ intent }) => intent,
        not_intent: ({ not_intent: notIntent }) => notIntent,
    },
    SlotFillingFromText: {
        type: ({ type }) => type,
        intent: ({ intent }) => intent,
        not_intent: ({ not_intent: notIntent }) => notIntent,
    },
};
