/* eslint-disable no-unused-vars */
import {
    getBotResponses,
    getBotResponse,
    updateResponse,
    createResponse,
    deleteResponse,
} from '../mongo/botResponses';

const { PubSub } = require('apollo-server-express');

const pubsub = new PubSub();
const RESPONSE_ADDED = 'RESPONSE_ADDED';

export default {
    Subscription: {
        botResponseAdded: {
            subscribe: () => pubsub.asyncIterator([RESPONSE_ADDED]),
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
            const response = await deleteResponse(args.projectId, args.key);
            return { success: response.ok === 1 };
        },
        async updateResponse(_, args, __) {
            const response = await updateResponse(args.projectId, args.key, args.response);
            return { success: response.ok === 1 };
        },
        async createResponse(_, args, __) {
            const response = await createResponse(args.projectId, args.response);
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
