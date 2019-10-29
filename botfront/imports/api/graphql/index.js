import { mergeTypes } from 'merge-graphql-schemas';

import conversationResolvers from './conversations/resolvers';
import nluResolvers from './nlu/resolvers';
import conversationTypes from './conversations/schemas';
import nluTypes from './nlu/schemas';

export const resolvers = [
    ...conversationResolvers,
    ...nluResolvers,
];
export const typeDefs = mergeTypes([
    ...conversationTypes,
    ...nluTypes,
], { all: true });
