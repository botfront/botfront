import { mergeTypes } from 'merge-graphql-schemas';

import conversationResolvers from './conversations/resolvers';
import nluResolvers from './nlu/resolvers';
import conversationTypes from './conversations/schemas';
import nluTypes from './nlu/schemas';
import activityResolver from './activity/resolvers/activityResolver';
import activityTypes from './activity/schemas';
import commonResolver from './common/commonResolver';
import commonTypes from './common/common.types.graphql';

export const resolvers = [
    ...conversationResolvers,
    ...nluResolvers,
    activityResolver,
    commonResolver,
];
export const typeDefs = mergeTypes([
    ...conversationTypes,
    ...nluTypes,
    ...activityTypes,
    commonTypes,
], { all: true });
