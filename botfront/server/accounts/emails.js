import { Accounts } from 'meteor/accounts-base';

Accounts.emailTemplates.siteName = 'Botfront';
Accounts.emailTemplates.from = 'Nathan from Botfront <support@botfront.io>';

Accounts.emailTemplates.verifyEmail = {
    subject() {
        return 'Verify Your Email Address';
    },
    text(user, url) {
        const urlWithoutHash = `${url.replace('#/', '')}/${user._id}`;

        const supportEmail = 'support@botfront.io';

        return `Please click on the following link to verify your email address:\n${urlWithoutHash}\n\nIf you did not request this verification, please ignore this email. We're always happy to help: ${supportEmail}.`;
    },
};

Accounts.emailTemplates.resetPassword = {
    subject() {
        return 'Reset your password';
    },
    text(user, url) {
        const urlWithoutHash = url.replace('#/', '');
        const supportEmail = 'support@botfront.io';
        return `Hello,\n\nTo reset your password, simply click the link below:\n${urlWithoutHash}\n\nIf you did not request this, please ignore this email.We're always happy to help: ${supportEmail}.`;
    },
};


Accounts.emailTemplates.enrollAccount = {
    subject() {
        return 'Welcome to Botfront';
    },
    text(user, url) {
        const urlWithoutHash = url.replace('#/', '');
        const supportEmail = 'support@botfront.io';
        return `Hello,\n\nTo create your password and start using Botfront, simply click on this link:\n${urlWithoutHash}\n\nWe're always happy to help: ${supportEmail}.`;
    },
};
