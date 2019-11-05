import path from 'path';
import { fileLoader, mergeTypes } from 'merge-graphql-schemas';

import conversationsResolver from './conversations/resolvers/conversationsResolver';
/*
* mergeResolvers doesnt work (https://github.com/Urigo/merge-graphql-schemas/issues?utf8=%E2%9C%93&q=unexpected+token)
* so we need to import resolvers one by one
*/
export const resolvers = [
    conversationsResolver,
];
const basePath = path.join(/(.+botfront\/)/.exec(process.cwd())[1], __dirname);
const typesArray = fileLoader(path.join(basePath, '..', '**', '*.graphql'));

// const resolversArray = fileLoader(path.join(basePath, '..', '**', '*Resolver.js'));

export const typeDefs = mergeTypes(typesArray, { all: true });
