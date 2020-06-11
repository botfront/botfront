import { RegularExpression } from 'graphql-scalars';
import {
    getForms,
    upsertForm,
    deleteForms,
    submitForm,
    importSubmissions,
} from './mongo/forms';
import { checkIfCan } from '../../../lib/scopes';

const { PubSub, withFilter } = require('apollo-server-express');

const pubsub = new PubSub();
const FORMS_MODIFIED = 'FORMS_MODIFIED';
const FORMS_DELETED = 'FORMS_DELETED';
const FORMS_CREATED = 'FORMS_CREATED';

export const subscriptionFilter = (payload, variables, context) => {
    if (checkIfCan('stories:r', payload.projectId, context.userId, { backupPlan: true })) {
        return payload.projectId === variables.projectId;
    }
    return false;
};

export default {
    Subscription: {
        formsModified: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([FORMS_MODIFIED]),
                subscriptionFilter,
            ),
        },
        formsDeleted: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([FORMS_DELETED]),
                subscriptionFilter,
            ),
        },
        formsCreated: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([FORMS_CREATED]),
                subscriptionFilter,
            ),
        },
    },
    Query: {
        getForms: async (_, args, context) => {
            checkIfCan('stories:r', args.projectId, context.user._id);
            return getForms(args.projectId, args.ids);
        },
    },
    Mutation: {
        submitForm: async (_root, args, context) => submitForm(args),
        importSubmissions: async (_root, args, context) => importSubmissions(args),
        upsertForm: async (_, args, context) => {
            checkIfCan('stories:w', args.form.projectId, context.user._id);
            const { status, value } = await upsertForm(args);
            if (status !== 'failed') {
                const publication = status === 'inserted' ? FORMS_CREATED : FORMS_MODIFIED;
                const key = status === 'inserted' ? 'formsCreated' : 'formsModified';
                pubsub.publish(publication, {
                    projectId: args.form.projectId,
                    [key]: value,
                });
                return { _id: value._id };
            }
            return {};
        },
        deleteForms: async (_, args, context) => {
            checkIfCan('stories:w', args.projectId, context.user._id);
            const result = await deleteForms(args);
            pubsub.publish(FORMS_DELETED, {
                projectId: args.projectId,
                formsDeleted: result,
            });
            return result;
        },
    },
    FormName: new RegularExpression('FormName', /^[a-zA-Z0-9-_]+_form$/),
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
        __resolveType: (v) => {
            if (v.type === 'from_text') return 'SlotFillingFromText';
            if (v.type === 'from_entity') return 'SlotFillingFromEntity';
            if (v.type === 'from_trigger_intent') return 'SlotFillingFromIntent';
            if (v.type === 'from_intent') return 'SlotFillingFromIntent';
            return 'SlotFillingFromText';
        },
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
