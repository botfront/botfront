/* eslint-disable no-unused-vars */
import {
    getBotResponses,
    getBotResponse,
    updateResponse,
    createResponse,
    deleteResponse,
} from '../mongo/botResponses';

const { PubSub, withFilter } = require('apollo-server-express');

const pubsub = new PubSub();
const RESPONSE_ADDED = 'RESPONSE_ADDED';
const RESPONSES_MODIFIED = 'RESPONSES_MODIFIED';
const RESPONSE_DELETED = 'RESPONSE_DELETED';


export default {
    Subscription: {
        botResponseAdded: {
            subscribe: () => pubsub.asyncIterator([RESPONSE_ADDED]),
        },
        botResponsesModified: {
            subscribe:
            withFilter(
                () => pubsub.asyncIterator([RESPONSES_MODIFIED]),
                (payload, variables) => payload.projectId === variables.projectId,
            ),
        },
        botResponseDeleted: {
            subscribe:
            withFilter(
                () => pubsub.asyncIterator([RESPONSE_DELETED]),
                (payload, variables) => payload.projectId === variables.projectId,
            ),
        },
    },
    Query: {
        async botResponses(_, args, __) {
            return getBotResponses(args.projectId);
        },
        async botResponse(_, args, __) {
            return getBotResponse(args.projectId, args.key, args.lang);
        },
    },
    Mutation: {
        async deleteResponse(_, args, __) {
            const toBeDeleted = await getBotResponse(args.projectId, args.key);
            const response = await deleteResponse(args.projectId, args.key);
            pubsub.publish(RESPONSE_DELETED, { projectId: args.projectId, botResponseDeleted: toBeDeleted });
            return { success: response.ok === 1 };
        },
        async updateResponse(_, args, __) {
            const response = await updateResponse(args.projectId, args.key, args.response);
            pubsub.publish(RESPONSES_MODIFIED, { projectId: args.projectId, botResponsesModified: args.response });
            return { success: response.ok === 1 };
        },
        async createResponse(_, args, __) {
            const response = await createResponse(args.projectId, args.response);
            pubsub.publish(RESPONSES_MODIFIED, { projectId: args.projectId, botResponsesModified: args.response });
            pubsub.publish(RESPONSE_ADDED, { botResponseAdded: args.response });
            return { success: !!response.id };
        },
    },
    BotResponse: {
        key: (parent, _, __) => parent.key,
        _id: (parent, _, __) => parent._id,
        projectId: (parent, _, __) => parent.projectId,
        values: (parent, _, __) => parent.values,
        match: (parent, _, __) => parent.match,
        followUp: (parent, _, __) => parent.followUp,
    },
    Value: {
        lang: (parent, _, __) => parent.lang,
        sequence: (parent, _, __) => parent.sequence,
    },
    ContentContainer: {
        content: (parent, _, __) => parent.content,
    },
    FollowUp: {
        action: (parent, _, __) => parent.action,
        delay: (parent, _, __) => parent.delay,
    },
    Match: {
        nlu: (parent, _, __) => parent.nlu,
    },
    Nlu: {
        intent: (parent, _, __) => parent.intent,
        entities: (parent, _, __) => parent.entities,
    },
    Entity: {
        entity: (parent, _, __) => parent.entity,
        value: (parent, _, __) => parent.value,
    },
};
