import { Accounts } from 'meteor/accounts-base';
import SimpleSchema from 'simpl-schema';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import slugify from 'slugify';
import axios from 'axios';
import { safeLoad, safeDump } from 'js-yaml';

import { GlobalSettings } from './globalSettings/globalSettings.collection';
import { passwordComplexityRegex } from './user/user.methods';
import { languages } from '../lib/languages';

const accountSetupSchema = new SimpleSchema(
    {
        firstName: { type: String, min: 1 },
        lastName: { type: String, min: 1 },
        email: {
            type: String,
            regEx: SimpleSchema.RegEx.EmailWithTLD,
        },
        password: {
            type: String,
            custom() {
                return !this.value.match(passwordComplexityRegex) ? 'passwordTooSimple' : null;
            },
        },
        passwordVerify: {
            type: String,
            custom() {
                return this.value !== this.field('password').value ? 'passwordMismatch' : null;
            },
        },
    },
    { tracker: Tracker },
);

const newProjectSchema = new SimpleSchema(
    {
        project: {
            type: String,
            min: 1,
            custom() {
                return !this.value.match(/^[A-Za-z0-9 ]+$/) ? 'projectName' : null;
            },
        },
        language: { type: String, allowedValues: Object.keys(languages) },
    },
    { tracker: Tracker },
);

newProjectSchema.messageBox.messages({
    en: {
        projectName: 'The name can only contain alphanumeric characters',
    },
});

accountSetupSchema.messageBox.messages({
    en: {
        passwordMismatch: 'The passwords are not matching. Make sure you enter the same password in both fields',
        passwordTooSimple: 'Your password should contain at least 9 characters and have uppercase, lowercase, digit and special characters',
    },
});

export { accountSetupSchema, newProjectSchema };


if (Meteor.isServer) {
    import {
        getAppLoggerForFile,
        getAppLoggerForMethod,
        addLoggingInterceptors,
    } from '../../server/logger';

    const requestMailSubscription = async (email, firstName, lastName) => {
        const mailChimpUrl = process.env.MAILING_LIST_URI
            || 'https://europe-west1-botfront-project.cloudfunctions.net/subscribeToMailchimp';
        const appMethodLogger = getAppLoggerForMethod(
            getAppLoggerForFile(__filename),
            'requestMailSubscription',
            Meteor.userId(),
            { email, firstName, lastName },
        );
        try {
            const mailAxios = axios.create();
            addLoggingInterceptors(mailAxios, appMethodLogger);
            await mailAxios.post(mailChimpUrl, {
                email_address: email,
                status: 'subscribed',
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName,
                },
            });
        } catch (e) {
            appMethodLogger.error(
                'Email subscription failed, probably because you\'ve already subscribed',
            );
        }
    };
    Meteor.methods({
        async 'initialSetup.firstStep'(accountData, consent) {
            check(accountData, Object);
            check(consent, Boolean);

            const publicSettings = safeLoad(Assets.getText('defaults/public.yaml'));
            const privateSettings = safeLoad(Assets.getText(
                process.env.MODE === 'development' ? 'defaults/private.dev.yaml' : 'defaults/private.yaml',
            ));
            
            const settings = {
                public: {
                    backgroundImages: publicSettings.backgroundImages || [],
                    defaultNLUConfig: safeDump({ pipeline: publicSettings.pipeline }),
                },
                private: {
                    bfApiHost: privateSettings.bfApiHost || '',
                    defaultEndpoints: safeDump(privateSettings.endpoints),
                    defaultCredentials: safeDump(privateSettings.credentials),
                    defaultPolicies: safeDump({ policies: privateSettings.policies }),
                    defaultDefaultDomain: safeDump(privateSettings.defaultDomain),
                },
            };
            
            GlobalSettings.insert({ _id: 'SETTINGS', settings });

            const empty = await Meteor.callWithPromise('users.checkEmpty');
            if (!empty) {
                throw new Meteor.Error('403', 'Not authorized');
            }
            const {
                email, password, firstName, lastName,
            } = accountData;
            const userId = Accounts.createUser({
                email,
                password,
                profile: {
                    firstName,
                    lastName,
                },
            });

            if (consent) {
                await requestMailSubscription(accountData.email, accountData.firstName, accountData.lastName);
            }
        },

        async 'initialSetup.secondStep'(projectData) {
            check(projectData, Object);
            const project = {
                name: projectData.project,
                namespace: slugify(projectData.project, { lower: true }),
                defaultLanguage: projectData.language,
                languages: [projectData.language],
            };

            if (process.env.BF_PROJECT_ID) project._id = process.env.BF_PROJECT_ID;
            
            const projectId = await Meteor.callWithPromise('project.insert', project);

            await Meteor.callWithPromise(
                'nlu.insert',
                projectId,
                projectData.language,
            );

            return projectId;
        },
    });
}
