import path from 'path';
import { fileLoader, mergeTypes } from 'merge-graphql-schemas';

import entityDistributionResolver from './nlu/entityDistributionResolver';
import intentDistributionResolver from './nlu/intentDistributionResolver';
/*
* mergeResolvers doesnt work (https://github.com/Urigo/merge-graphql-schemas/issues?utf8=%E2%9C%93&q=unexpected+token) 
* so we need to import resolvers one by one
*/
export const resolvers = [
    entityDistributionResolver,
    intentDistributionResolver,
];
const basePath = path.join(/(.+)\.meteor/.exec(process.cwd())[1], __dirname);
const typesArray = fileLoader(path.join(basePath, '..', '**', '*.graphql'));

// const resolversArray = fileLoader(path.join(basePath, '..', '**', '*Resolver.js'));

export const typeDefs = mergeTypes(typesArray, { all: true });
