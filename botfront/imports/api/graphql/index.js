import { mergeTypes } from 'merge-graphql-schemas';
import conversationsResolver from './conversations/resolvers/conversationsResolver';
import conversationTypes from './conversations/schemas';
import activityResolver from './activity/resolvers/activityResolver';
import activityTypes from './activity/schemas';
import commonResolver from './common/commonResolver';
import commonTypes from './common/common.types.graphql';

export const resolvers = [
    conversationsResolver,
    activityResolver,
    commonResolver,
];

export const typeDefs = mergeTypes([...conversationTypes, ...activityTypes, commonTypes], { all: true });
