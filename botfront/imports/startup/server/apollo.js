import mongoose from 'mongoose';
import { ApolloServer } from 'apollo-server-express';
import { WebApp } from 'meteor/webapp';
import { getUser } from 'meteor/apollo';
import { typeDefs, resolvers } from '../../api/graphql/index';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:3001/meteor';

mongoose.connect(MONGO_URL, { server: { socketOptions: { keepAlive: 1 } } });
mongoose.connection.on('error', () => {
    throw new Error(`unable to connect to database: ${MONGO_URL}`);
});

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => ({
        user: await getUser(req.headers.authorization),
    }),
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
