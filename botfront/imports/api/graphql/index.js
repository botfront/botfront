import { mergeTypes } from 'merge-graphql-schemas';
import conversationsResolver from './conversations/resolvers/conversationsResolver';
import conversationTypes from './conversations/schemas';
/*
* mergeResolvers doesnt work (https://github.com/Urigo/merge-graphql-schemas/issues?utf8=%E2%9C%93&q=unexpected+token)
* so we need to import resolvers one by one
*/
export const resolvers = [
    conversationsResolver,
];

export const typeDefs = mergeTypes([...conversationTypes], { all: true });
