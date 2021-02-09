import { GraphQLScalarType, GraphQLString } from 'graphql';
import { Kind } from 'graphql/language';
import GraphQLJSON from 'graphql-type-json';
import moment from 'moment';

export default {
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value);
        },
        serialize(value) {
            return value.getTime();
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return new Date(ast.value);
            }
            return null;
        },
    }),
    Moment: new GraphQLScalarType({
        name: 'Moment',
        description: 'Moment custom scalar type',
        parseValue(value) {
            return moment(value);
        },
        serialize(value) {
            return moment(value).toISOString();
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.STRING) {
                return moment(ast.value);
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
