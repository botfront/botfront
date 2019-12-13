import mongoose from 'mongoose';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import { WebApp } from 'meteor/webapp';
import { getUser } from 'meteor/apollo';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { makeExecutableSchema } from 'graphql-tools';
import { typeDefs, resolvers } from '../../api/graphql/index';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:3001/meteor';

mongoose.connect(MONGO_URL, {
    keepAlive: 1,
    useUnifiedTopology: 1,
    useFindAndModify: 0,
    useNewUrlParser: 1,
});
mongoose.connection.on('error', () => {
    throw new Error(`unable to connect to database: ${MONGO_URL}`);
});


const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        const { headers: { authorization } } = req;
        if (!authorization) throw new AuthenticationError('Missing authorization header');
        if (process.env.API_KEY && process.env.API_KEY === authorization) return ({});
        const user = await getUser(req.headers.authorization);
        if (!user) throw new AuthenticationError('Unauthorized');
        return ({ user });
    },
});

server.applyMiddleware({
    app: WebApp.connectHandlers,
    path: '/graphql',
});

WebApp.connectHandlers.use('/graphql', (req, res) => {
    if (req.method === 'GET') {
        res.end();
    }
});
