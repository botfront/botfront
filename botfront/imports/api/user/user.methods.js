import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';

import queryString from 'query-string';
import axios from 'axios';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';
import {
    setScopes, checkIfCan, getUserScopes, can,
} from '../../lib/scopes';


export const passwordComplexityRegex = /^(?:(?=.*[a-z])(?:(?=.*[A-Z])(?=.*[\d\W])|(?=.*\W)(?=.*\d))|(?=.*\W)(?=.*[A-Z])(?=.*\d)).{9,}$/;


if (Meteor.isServer) {
    import { getAppLoggerForMethod, getAppLoggerForFile, addLoggingInterceptors } from '../../../server/logger';

    const userAppLogger = getAppLoggerForFile(__filename);

    const canEditUser = (userId) => {
        checkIfCan('users:w', { anyScope: true });
        const scopes = Meteor.roleAssignment.find({ user: { _id: userId } }, { scope: 1 }).fetch();
        if (Array.isArray(scopes)) {
            scopes.forEach((scope) => {
                checkIfCan('users:w', scope);
            });
        }
    };

    Meteor.publish('userData', function() {
        if (can('users:r')) {
            return Meteor.users.find({}, { fields: { emails: 1, profile: 1, roles: 1 } });
        }
        const permittedScopes = getUserScopes(Meteor.userId(), 'users:r');
        const allRoleAssignments = Meteor.roleAssignment.find({}, { fields: { user: 1, scope: 1 } }).fetch();
        const userRoles = {};
        allRoleAssignments.forEach(({ user, scope }) => {
            if (!userRoles[user._id]) userRoles[user._id] = [];
            userRoles[user._id].push(scope);
        });
        const userIds = Object.keys(userRoles).filter((key) => {
            const userScopes = userRoles[key];
            return userScopes.every(userScope => permittedScopes.some(permittedScope => permittedScope === userScope));
        });
        return Meteor.users.find({ _id: { $in: userIds } }, { fields: { emails: 1, profile: 1, roles: 1 } });
    });

    Meteor.methods({
        'user.create'(user, sendInviteEmail) {
            checkIfCan('users:w', { anyScope: true });
            if (Array.isArray(user.roles)) {
                user.roles.forEach(({ project }) => {
                    checkIfCan('users:w', project);
                });
            }
            check(user, Object);
            check(sendInviteEmail, Boolean);
            try {
                const userId = Accounts.createUser({
                    email: user.email.trim(),
                    profile: {
                        firstName: user.profile.firstName,
                        lastName: user.profile.lastName,
                    },
                });
                this.unblock();
                if (sendInviteEmail) Accounts.sendEnrollmentEmail(userId);
                setScopes(user, userId);
                return userId;
            } catch (e) {
                console.log(e);
                throw e;
            }
        },

        'user.update'(user) {
            check(user, Object);
            checkIfCan('users:w', { anyScope: true });
            user.roles.forEach(({ project }) => {
                checkIfCan('users:w', project === 'GLOBAL' ? null : project);
            });
            try {
                Meteor.users.update(
                    { _id: user._id },
                    {
                        $set: {
                            profile: user.profile,
                            'emails.0.address': user.emails[0].address,
                            'emails.0.verified': true,
                            roles: [], // re-added after
                        },
                    },
                );
                setScopes(user, user._id);
            } catch (e) {
                throw e;
            }
        },
        // eslint-disable-next-line consistent-return
        'user.remove'(userId, options = {}) {
            canEditUser(userId);
            check(userId, String);
            check(options, Object);
            const { failSilently } = options;
            try {
                Meteor.users.remove({ _id: userId });
            } catch (e) {
                if (!failSilently) throw e;
            }
        },

        'user.removeByEmail'(email) {
            checkIfCan('users:w');
            check(email, String);
            try {
                return Meteor.users.remove({
                    emails: [{
                        address: email,
                        verified: false,
                    }],
                });
            } catch (e) {
                throw e;
            }
        },

        'user.changePassword'(userId, newPassword) {
            canEditUser(userId);
            check(userId, String);
            check(newPassword, String);

            try {
                return Promise.await(Accounts.setPassword(userId, newPassword));
            } catch (e) {
                throw e;
            }
        },

        'users.checkEmpty'() {
            try {
                // don't count EXTERNAL_CONSUMER for Welcome screen check
                return Meteor.users.find({ username: { $ne: 'EXTERNAL_CONSUMER' } }).count() === 0;
            } catch (e) {
                throw e;
            }
        },

        'user.verifyReCaptcha'(response) {
            const appMethodLogger = getAppLoggerForMethod(
                userAppLogger,
                'user.verifyReCaptcha',
                Meteor.userId(),
                { response },
            );

            check(response, String);
            const {
                settings: { private: { reCatpchaSecretServerKey: secret = null } = {} } = {},
            } = GlobalSettings.findOne(
                {},
                { fields: { 'settings.private.reCatpchaSecretServerKey': 1 } },
            );
            const qs = queryString.stringify({ response, secret });
            try {
                this.unblock();
                const url = `https://www.google.com/recaptcha/api/siteverify?${qs}`;
                const reCaptchaAxios = axios.create();
                addLoggingInterceptors(reCaptchaAxios, appMethodLogger);
                const result = Promise.await(reCaptchaAxios.post(url));
                if (result.data.success) return 'OK';
                throw new Meteor.Error(
                    '403',
                    'Something went wrong when verifying the reCaptcha. Please try again.',
                );
            } catch (e) {
                throw e;
            }
        },
    });
}
