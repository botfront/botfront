import { mergeTypes } from 'merge-graphql-schemas';

import conversationResolvers from './conversations/resolvers';
import nluResolvers from './nlu/resolvers';
import conversationTypes from './conversations/schemas';
import nluTypes from './nlu/schemas';
/*
* mergeResolvers doesnt work (https://github.com/Urigo/merge-graphql-schemas/issues?utf8=%E2%9C%93&q=unexpected+token)
* so we need to import resolvers one by one
*/
export const resolvers = [
    ...conversationResolvers,
    ...nluResolvers,
];
export const typeDefs = mergeTypes([
    ...conversationTypes,
    ...nluTypes,
], { all: true });
