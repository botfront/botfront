/* global Migrations */
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import BotResponses from '../graphql/botResponses/botResponses.model';
import { indexStory } from '../story/stories.index';
import { indexBotResponse } from '../graphql/botResponses/mongo/botResponses';
import { Stories } from '../story/stories.collection';
import {
    formatError, f1, f4, f9,
} from '../../lib/utils';
import {
    GlobalSettings, f2, f5, f8,
} from './globalSettings.collection';
import {
    checkIfCan, f3, f6, f7,
} from '../../lib/scopes';


if (Meteor.isServer) {
    const f10 = () => `${f1()}\n${f2()}\n${f3()}\n${f4()}\n${f5()}\n${f6()}\n${f7()}\n${f8()}\n${f9()}`;

    const getCertAndToken = (licenseKey) => {
        const token = licenseKey;
        const cert = f10();
        return { cert, token };
    };


    const checkQuota = (field, getCoundMethodName) => {
        const { LICENSE_KEY } = process.env;
        if (!LICENSE_KEY) return 'noLicense';
        const { cert, token } = getCertAndToken(LICENSE_KEY);
        let quota = -1;
        try {
            const decoded = jwt.verify(token, cert);
            if (decoded[field] !== 0) quota = decoded[field];
        } catch (e) {
            quota = 0;
        }
        const count = Meteor.call(getCoundMethodName);
        if (quota !== -1) return quota - count;
        return 1; // always return one, so it's unlimited, only happens when   is set to 0
    };

    Meteor.methods({
        'settings.save'(settings) {
            checkIfCan('global-settings:w');
            check(settings, Object);
            try {
                return GlobalSettings.update({ _id: 'SETTINGS' }, { $set: settings });
            } catch (e) {
                throw formatError(e);
            }
        },

        'getRestartRasaWebhook'(projectId) {
            checkIfCan('projects:w', projectId);
            check(projectId, String);
            return GlobalSettings.findOne({ _id: 'SETTINGS' }, { fields: { 'settings.private.webhooks.restartRasaWebhook': 1 } });
        },
        'getDeploymentWebhook'(projectId) {
            checkIfCan('projects:w', projectId);
            check(projectId, String);
            return GlobalSettings.findOne({ _id: 'SETTINGS' }, { fields: { 'settings.private.webhooks.deploymentWebhook': 1 } });
        },
        'global.rebuildIndexes'() {
            checkIfCan('global-admin');
            BotResponses.find()
                .lean()
                .then((botResponses) => {
                    botResponses.forEach((botResponse) => {
                        const textIndex = indexBotResponse(botResponse);
                        BotResponses.updateOne({ _id: botResponse._id }, { textIndex }).exec();
                    });
                });
            const allStories = Stories.find().fetch();
            allStories.forEach((story) => {
                const { textIndex } = indexStory(story);
                Stories.update({ _id: story._id }, { $set: { textIndex } });
            });
        },
        'settings.getMigrationStatus'() {
            checkIfCan('global-admin');
            // eslint-disable-next-line no-underscore-dangle
            const { locked, version } = Migrations._getControl();
            // eslint-disable-next-line no-underscore-dangle
            const latest = Migrations._list.length - 1;
            return { locked, version, latest };
        },
        'settings.unlockMigration' () {
            checkIfCan('global-admin');
            Migrations.unlock();
        },
        'checkLicense'() {
            const { LICENSE_KEY } = process.env;
            if (!LICENSE_KEY) return 'noLicense';
            const { cert, token } = getCertAndToken(LICENSE_KEY);
            let validity = 'valid';
            try {
                const decoded = jwt.verify(token, cert);
                if (decoded.exp < Date.now() / 1000) validity = 'expired';
            } catch (e) {
                validity = 'expired';
            }
            return validity;
        },

        'checkLicenseUserLeft'() {
            return (checkQuota('usersQuota', 'users.getCount'));
        },

        'checkLicenseProjectLeft'() {
            return (checkQuota('projectsQuota', 'project.getCount'));
        },

        'getLicenseInfo'() {
            const { LICENSE_KEY } = process.env;
            if (!LICENSE_KEY) return 0;
            const { cert, token } = getCertAndToken(LICENSE_KEY);
            let licenseInfo = {};
            try {
                const decoded = jwt.verify(token, cert);
                licenseInfo = decoded;
            } catch (e) {
                licenseInfo = {};
            }
            return licenseInfo;
        },

        'getTimeLeft'() {
            const { LICENSE_KEY } = process.env;
            if (!LICENSE_KEY) return {};
            const { cert, token } = getCertAndToken(LICENSE_KEY);
            let left = {};
            try {
                const decoded = jwt.verify(token, cert);
                left = { trial: decoded.trial, time: decoded.exp - (Date.now() / 1000) };
            } catch (e) {
                left = {};
            }
            return left;
        },
    });
}
