import { mergeTypes } from 'merge-graphql-schemas';
import conversationsResolver from './conversations/resolvers/conversationsResolver';
import conversationTypes from './conversations/schemas';
import activityResolver from './activity/resolvers/activityResolver';
import activityTypes from './activity/schemas';
import commonResolver from './common/commonResolver';
import commonTypes from './common/common.types.graphql';
import botResponsesResolver from './botResponses/resolvers/botResponsesResolver';
import botResponsesTypes from './botResponses/schemas';

export const resolvers = [
    conversationsResolver,
    botResponsesResolver,
    activityResolver,
    commonResolver,
];

export const typeDefs = mergeTypes([...conversationTypes, ...botResponsesTypes, ...activityTypes, commonTypes], { all: true });
