import mongoose from 'mongoose';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import { WebApp } from 'meteor/webapp';
import { getUser } from 'meteor/apollo';
import { typeDefs, resolvers, schemaDirectives } from '../../api/graphql/index';

const MONGO_URL = process.env.MONGO_URL || `mongodb://localhost:${(process.env.METEOR_PORT || 3000) + 1}/meteor`;

export const connectToDb = () => {
    mongoose.connect(MONGO_URL, {
        keepAlive: 1,
        useUnifiedTopology: 1,
        useFindAndModify: 0,
        useNewUrlParser: 1,
        useCreateIndex: 1,
    });
    mongoose.connection.on('error', () => {
        throw new Error(`unable to connect to database: ${MONGO_URL}`);
    });
};

export const runAppolloServer = () => {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({ req: { headers: { authorization } } }) => {
            // If API_KEY set and authorization not corresponding: error
            if (process.env.API_KEY && (!authorization || (process.env.API_KEY !== authorization))) throw new AuthenticationError('Missing authorization header');

            const user = await getUser(authorization);
            // Authorization header and no corresponding user: Error
            if (authorization && !user) throw new AuthenticationError('Unauthorized');

            return ({ user });
        },
        schemaDirectives,
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
};

Meteor.startup(() => {
    if (Meteor.isServer) {
        connectToDb();
        runAppolloServer();
    }
});
