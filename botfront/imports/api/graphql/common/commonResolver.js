import { GraphQLScalarType, GraphQLString } from 'graphql';
import { Kind } from 'graphql/language';
import GraphQLJSON from 'graphql-type-json';

export default {
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            return value.getTime(); // value sent to the client
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return new Date(ast.value); // ast value is always in string format
            }
            return null;
        },
    }),
    Any: new GraphQLScalarType({
        name: 'Any',
        description: 'Arbitrary JSON value',
        parseValue: v => GraphQLJSON.parseValue(v),
        serialize: v => GraphQLJSON.serialize(v),
        parseLiteral: v => GraphQLJSON.parseLiteral(v),
    }),
};
