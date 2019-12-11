import { mergeTypes } from 'merge-graphql-schemas';

import conversationResolvers from './conversations/resolvers';
import nluResolvers from './nlu/resolvers';
import conversationTypes from './conversations/schemas';
import nluTypes from './nlu/schemas';
import activityResolver from './activity/resolvers/activityResolver';
import activityTypes from './activity/schemas';
import commonResolver from './common/commonResolver';
import commonTypes from './common/common.types.graphql';
import botResponsesResolver from './botResponses/resolvers/botResponsesResolver';
import botResponsesTypes from './botResponses/schemas';

export const resolvers = [
    ...conversationResolvers,
    ...nluResolvers,
    botResponsesResolver,
    activityResolver,
    commonResolver,
];
export const typeDefs = mergeTypes([
    ...conversationTypes,
    ...botResponsesTypes,
    ...nluTypes,
    ...activityTypes,
    commonTypes,
], { all: true });
