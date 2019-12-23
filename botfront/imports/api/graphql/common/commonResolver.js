import { GraphQLScalarType, GraphQLString } from 'graphql';
import { Kind } from 'graphql/language';

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
        description: 'Arbitrary value',
        parseValue: v => v,
        serialize: v => v,
        parseLiteral: v => v,
    }),
    StringOrListOfStrings: new GraphQLScalarType({
        name: 'StringOrListOfStrings',
        description: 'String | [String]',
        parseValue: v => (v.kind === 'ListValue'
            ? v.values.map(el => GraphQLString.parseValue(el))
            : GraphQLString.parseValue(v)),
        serialize: v => (v.kind === 'ListValue'
            ? v.values.map(el => GraphQLString.serialize(el))
            : GraphQLString.serialize(v)),
        parseLiteral: v => (v.kind === 'ListValue'
            ? v.values.map(el => GraphQLString.parseLiteral(el))
            : GraphQLString.parseLiteral(v)),
    }),
};
