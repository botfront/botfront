import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { Accounts } from 'meteor/accounts-base';
import dotenv from 'dotenv';
import { createGraphQLPublication } from 'meteor/swydo:ddp-apollo';
import { makeExecutableSchema } from '@graphql-tools/schema';
import axios from 'axios';
import { get } from 'lodash';
import { typeDefsWithUpload, resolvers } from '../imports/api/graphql/index';
import { getAppLoggerForFile } from './logger';
import { Projects } from '../imports/api/project/project.collection';
import { Instances } from '../imports/api/instances/instances.collection';

const fileAppLogger = getAppLoggerForFile(__filename);

Meteor.startup(function() {
    if (Meteor.isServer) {
        const packageInfo = require('./../package.json');
        const schema = makeExecutableSchema({
            typeDefs: typeDefsWithUpload, // makeExecutableSchema need to define upload when working with files
            resolvers,
        });

        createGraphQLPublication({
            schema,
        });
        dotenv.config({
            path: `${process.env.PWD}/.env`,
        });
        // Set ambiguous error messages on login errors
        // eslint-disable-next-line no-underscore-dangle
        Accounts._options.ambiguousErrorMessages = true;

        // Set up rate limiting on login
        Accounts.removeDefaultRateLimit();
        DDPRateLimiter.setErrorMessage((r) => {
            const { timeToReset } = r;
            const time = Math.ceil(timeToReset / 60000);
            return `Too many requests. Try again in ${time} minutes.`;
        });
        DDPRateLimiter.addRule(
            {
                userId: null,
                clientAddress: null,
                type: 'method',
                name: 'login',
                // eslint-disable-next-line no-unused-vars
                connectionId: connectionId => true,
            },
            5,
            300000,
        );


        fileAppLogger.info(`Botfront ${packageInfo.version} started`);
        Meteor.setInterval(async () => {
            try {
                const instancesInfo = await Instances.find();
                const newStatuses = await Promise.all(instancesInfo.map(async (instance) => {
                    let instanceState;
                    try {
                        const data = await axios.get(`${instance.host}/status`, { params: { token: instance.token }});
                        instanceState = get(data, 'data.num_active_training_jobs', -1);
                    } catch {
                        instanceState = -1;
                    }
                    if (instanceState >= 1) return { status: 'training', projectId: instance.projectId };
                    if (instanceState === 0) return { status: 'notTraining', projectId: instance.projectId };
                    if (instanceState === -1) return { status: 'notReachable', projectId: instance.projectId };
                }));
                newStatuses.forEach((status) => {
                    Projects.update({ _id: status.projectId }, { $set: { 'training.instanceStatus': status.status } });
                });
            } catch (e) {
                // eslint-disable-next-line no-console
                console.log(e);
                // eslint-disable-next-line no-console
                console.log('Something went wrong while trying to get the rasa status');
            }
        }, 10000); // run every 10 seconds == 10000 msec
    }
});
