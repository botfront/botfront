import { mergeTypes } from 'merge-graphql-schemas';
import conversationsResolver from './conversations/resolvers/conversationsResolver';
import conversationTypes from './conversations/schemas';
import activityResolver from './activity/resolvers/activityResolver';
import activityTypes from './activity/schemas';
/*
* mergeResolvers doesnt work (https://github.com/Urigo/merge-graphql-schemas/issues?utf8=%E2%9C%93&q=unexpected+token)
* so we need to import resolvers one by one
*/
export const resolvers = [
    conversationsResolver,
    activityResolver,
];

export const typeDefs = mergeTypes([...conversationTypes, ...activityTypes], { all: true });
