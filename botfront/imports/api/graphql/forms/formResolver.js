import { RegularExpression } from 'graphql-scalars';
import {
    getForms,
    upsertForm,
    deleteForms,
    submitForm,
    importSubmissions,
} from './mongo/forms';

const { PubSub, withFilter } = require('apollo-server-express');

const pubsub = new PubSub();
const FORMS_MODIFIED = 'FORMS_MODIFIED';
const FORMS_DELETED = 'FORMS_DELETED';
const FORMS_CREATED = 'FORMS_CREATED';

export default {
    Subscription: {
        formsModified: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([FORMS_MODIFIED]),
                (payload, variables) => payload.projectId === variables.projectId,
            ),
        },
        formsDeleted: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([FORMS_DELETED]),
                (payload, variables) => payload.projectId === variables.projectId,
            ),
        },
        formsCreated: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([FORMS_CREATED]),
                (payload, variables) => payload.projectId === variables.projectId,
            ),
        },
    },
    Query: {
        getForms: async (_, args, __) => getForms(args.projectId, args.ids),
    },
    Mutation: {
        submitForm: async (_root, args) => submitForm(args),
        importSubmissions: async (_root, args) => importSubmissions(args),
        upsertForm: async (_, args) => {
            const updatedForm = await upsertForm(args);
            if (updatedForm.formsAdded) {
                pubsub.publish(FORMS_CREATED, {
                    projectId: args.form.projectId,
                    formsCreated: {
                        ...args.form,
                        _id: updatedForm.formsAdded[0],
                    },
                });
                return { _id: updatedForm.formsAdded[0] };
            }
            const dataUpdate = {
                ...updatedForm,
                ...args.form,
            };
            pubsub.publish(FORMS_MODIFIED, {
                projectId: args.form.projectId,
                formsModified: dataUpdate,
            });
            return { _id: args.form._id };
        },
        deleteForms: async (_, args) => {
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
