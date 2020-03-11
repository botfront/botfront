import { mergeTypes } from 'merge-graphql-schemas';
import conversationsResolver from './conversations/resolvers/conversationsResolver';
import conversationTypes from './conversations/schemas';
import activityResolver from './activity/resolvers/activityResolver';
import activityTypes from './activity/schemas';
import commonResolver from './common/commonResolver';
import commonTypes from './common/common.types.graphql';
import botResponsesResolvers from './botResponses/resolvers';
import botResponsesTypes from './botResponses/schemas';
import configResolver from './config/configResolver';
import configTypes from './config/config.types.graphql';
import nluResolvers from './nlu/resolvers';
import nluTypes from './nlu/schemas';
import storiesTypes from './story/schemas/stories.types.graphql';
import storiesResolver from './story/resolvers/storiesResolver';

export const resolvers = [
    conversationsResolver,
    ...botResponsesResolvers,
    ...nluResolvers,
    activityResolver,
    commonResolver,
    configResolver,
    storiesResolver,
];

export const typeDefs = mergeTypes([
    ...conversationTypes,
    ...botResponsesTypes,
    ...activityTypes,
    ...nluTypes,
    commonTypes,
    configTypes,
    storiesTypes,
], { all: true });

export const schemaDirectives = {
};
