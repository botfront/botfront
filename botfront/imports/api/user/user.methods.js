import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import util from 'util';

import queryString from 'query-string';
import axios from 'axios';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';
import { checkIfCan, can, setScopes } from '../../lib/scopes';

export const passwordComplexityRegex = /^(?:(?=.*[a-z])(?:(?=.*[A-Z])(?=.*[\d\W])|(?=.*\W)(?=.*\d))|(?=.*\W)(?=.*[A-Z])(?=.*\d)).{9,}$/;

if (Meteor.isServer) {
    Meteor.publish('userData', function() {
        if (can('global-admin')) {
            return Meteor.users.find({}, { fields: { emails: 1, profile: 1, roles: 1 } });
        }
        return [];
    });

    Meteor.methods({
        'user.create'(user, sendInviteEmail) {
            check(user, Object);
            check(sendInviteEmail, Boolean);
            checkIfCan('global-admin');
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
            checkIfCan('global-admin');
            check(user, Object);
            try {
                Meteor.users.update(
                    { _id: user._id },
                    {
                        $set: {
                            profile: user.profile,
                            'emails.0.address': user.emails[0].address,
                            'emails.0.verified': true,
                            roles: [], // re-added after
                        }
                    },
                );
                setScopes(user, user._id);
            } catch (e) {
                throw e;
            }
        },
        // eslint-disable-next-line consistent-return
        'user.remove'(userId, options = {}) {
            checkIfCan('global-admin');
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
            checkIfCan('global-admin');
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
            checkIfCan('global-admin');
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
                return Meteor.users.find().count() === 0;
            } catch (e) {
                throw e;
            }
        },

        'user.verifyReCaptcha'(response) {
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
                const result = Promise.await(axios.post(url));
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
