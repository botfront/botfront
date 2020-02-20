/* eslint-disable no-unused-vars */
import {
    getBotResponses,
    getBotResponse,
    updateResponse,
    createAndOverwriteResponses,
    createResponse,
    createResponses,
    deleteResponse,
    deleteVariation,
    getBotResponseById,
    upsertResponse,
} from '../mongo/botResponses';
import { checkIfCan } from '../../../../lib/scopes';
import { auditLog } from '../../../../../server/logger';

const { PubSub, withFilter } = require('apollo-server-express');

const pubsub = new PubSub();
const RESPONSES_MODIFIED = 'RESPONSES_MODIFIED';
const RESPONSE_DELETED = 'RESPONSE_DELETED';

export const subscriptionFilter = (payload, variables, context) => {
    if (
        checkIfCan('responses:r', payload.projectId, context.userId, { backupPlan: true })
    ) {
        return payload.projectId === variables.projectId;
    }
    return false;
};

export default {
    Subscription: {
        botResponsesModified: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([RESPONSES_MODIFIED]),
                subscriptionFilter,
            ),
        },
        botResponseDeleted: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([RESPONSE_DELETED]),
                subscriptionFilter,
            ),
        },
    },
    Query: {
        async botResponses(_, args, auth) {
            checkIfCan('responses:r', args.projectId, auth.user._id);
            return getBotResponses(args.projectId);
        },
        async botResponse(_, args, auth) {
            checkIfCan('responses:r', args.projectId, auth.user._id);
            return getBotResponse(args.projectId, args.key);
        },
        async botResponseById(_, args, auth) {
            checkIfCan('responses:r', args.projectId, auth.user._id);
            return getBotResponseById(args._id);
        },
    },
    Mutation: {
        async deleteResponse(_, args, auth) {
            checkIfCan('responses:w', args.projectId, auth.user._id);
            const botResponseDeleted = await deleteResponse(args.projectId, args.key);
            auditLog('Deleting response', {
                userId: auth.user._id, type: 'delete', operation: 'response-deleted', resId: args.key, after: botResponseDeleted,
            });
            pubsub.publish(RESPONSE_DELETED, {
                projectId: args.projectId,
                botResponseDeleted,
            });
            return { success: !!botResponseDeleted };
        },
        async updateResponse(_, args, auth) {
            checkIfCan('responses:w', args.projectId, auth.user._id);
            const response = await updateResponse(
                args.projectId,
                args._id,
                args.response,
            );
            auditLog('Updating response', {
                userId: auth.user._id, type: 'update', operation: 'response-updated', resId: args._id, after: args.response,
            });
            pubsub.publish(RESPONSES_MODIFIED, {
                projectId: args.projectId,
                botResponsesModified: args.response,
            });
            return { success: response.ok === 1 };
        },
        createAndOverwriteResponses: async (_, { projectId: pid, responses }, auth) => {
            checkIfCan('responses:w', pid, auth.user._id);
            const response = await createAndOverwriteResponses(pid, responses);
            response.forEach(({ projectId, ...botResponsesModified }) => pubsub.publish(
                RESPONSES_MODIFIED, { projectId, botResponsesModified },
            ));
            return response;
        },
        upsertResponse: async (_, args, auth) => {
            checkIfCan('responses:w', args.projectId, auth.user._id);
            const response = await upsertResponse(args);
            const { projectId, ...botResponsesModified } = response;
            auditLog('Updating/Creating response', {
                userId: auth.user._id, type: 'update', operation: 'response-updated', resId: args.key, after: { botResponsesModified },
            });
            pubsub.publish(RESPONSES_MODIFIED, { projectId, botResponsesModified });
            return response;
        },
        async createResponse(_, args, auth) {
            checkIfCan('responses:w', args.projectId, auth.user._id);
            const response = await createResponse(args.projectId, args.response);
            pubsub.publish(RESPONSES_MODIFIED, {
                projectId: args.projectId,
                botResponsesModified: response,
            });
            auditLog('Creating response', {
                userId: auth.user._id, type: 'update', operation: 'response-created', resId: args.response.key, after: { response },
            });
            return { success: !!response.id };
        },
        async createResponses(_, args, auth) {
            checkIfCan('responses:w', args.projectId, auth.user._id);
            auditLog('Creating responses', {
                userId: auth.user._id, type: 'update', operation: 'response-created', resId: args.responses.map(resp => resp.key), after: { responses: args.responses },
            });
            const response = await createResponses(args.projectId, args.responses);
            return { success: !!response.id };
        },
        async deleteVariation(_, args, auth) {
            checkIfCan('responses:w', args.projectId, auth.user._id);
            const response = await deleteVariation(args);
            auditLog('Deleting response variation', {
                userId: auth.user._id, type: 'update', operation: 'response-created', resId: args.key, after: { response },
            });
            pubsub.publish(RESPONSES_MODIFIED, {
                projectId: args.projectId,
                botResponsesModified: response,
            });
            return { success: !!response };
        },
    },
    BotResponse: {
        key: (parent, _, __) => parent.key,
        _id: (parent, _, __) => parent._id,
        projectId: (parent, _, __) => parent.projectId,
        values: (parent, _, __) => parent.values,
    },
    BotResponseValue: {
        lang: (parent, _, __) => parent.lang,
        sequence: (parent, _, __) => parent.sequence,
    },
    ContentContainer: {
        content: (parent, _, __) => parent.content,
    },
};
