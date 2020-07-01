
import SimpleSchema from 'simpl-schema';
import { languages } from '../../lib/languages';

import { ENVIRONMENT_OPTIONS } from '../../ui/components/constants.json';
import { validateYaml, validateJSON } from '../../lib/utils';

export const DefaultDomainSchema = new SimpleSchema({
    content: {
        type: String,
        custom: validateYaml,
    },
});

export const logosSchema = new SimpleSchema({
    smallLogoUrl: { type: String, optional: true },
    logoUrl: { type: String, optional: true },
});

export const chatWidgetSettingsSchema = new SimpleSchema({
    title: { type: String, optional: true, defaultValue: 'Botfront' },
    // we need to validate the user input (JSON), but we want to store it as an Object, thus the double type
    customData: SimpleSchema.oneOf({ type: String, optional: true, custom: validateJSON }, { type: Object, optional: true, blackbox: true }),
    subtitle: { type: String, optional: true, defaultValue: 'Happy to help' },
    profileAvatar: { type: String, optional: true },
    openLauncherImage: { type: String, optional: true },
    inputTextFieldHint: { type: String, optional: true, defaultValue: 'Type your message...' },
    closeImage: { type: String, optional: true },
    initPayload: { type: String, optional: true, defaultValue: '/get_started' },
    mainColor: { type: String, optional: true },
    conversationBackgroundColor: { type: String, optional: true },
    userTextColor: { type: String, optional: true },
    userBackgroundColor: { type: String, optional: true },
    assistTextColor: { type: String, optional: true },
    assistBackgoundColor: { type: String, optional: true },
    displayUnreadCount: { type: Boolean, optional: true },
    hideWhenNotConnected: { type: Boolean, optional: true, defaultValue: true },
    showCloseButton: { type: Boolean, optional: true },
    showFullScreenButton: { type: Boolean, optional: true },
    disableTooltips: { type: Boolean, optional: true },
    showMessageDate: { type: Boolean, optional: true },
    autoClearCache: { type: Boolean, optional: true },
    defaultHighlightClassname: { type: String, optional: true },
    defaultHighlightCss: { type: String, optional: true },
    defaultHighlightAnimation: { type: String, optional: true },
}, { strict: false });

export const ProjectsSchema = new SimpleSchema({
    name: {
        type: String,
        index: 1,
        custom() {
            return !this.value.match(/^[A-Za-z0-9 ]+$/) ? 'name' : null;
        },
    },
    namespace: {
        type: String,
        unique: 1,
        sparse: 1,
        custom() {
            return !this.value.match(/^bf-[a-zA-Z0-9-]+$/) ? 'invalidNamespace' : null;
        },
    },
    modelsBucket: { type: String, regEx: /^[a-z0-9-_]+$/, optional: true },
    nluThreshold: {
        type: Number, defaultValue: 0.75, min: 0.5, max: 0.95,
    },
    timezoneOffset: {
        type: Number, defaultValue: 0, min: -22, max: 22,
    },
    enableSharing: { type: Boolean, defaultValue: false },
    defaultLanguage: { type: String, allowedValues: Object.keys(languages) },
    createdAt: { type: Date, optional: true },
    disabled: { type: Boolean, defaultValue: false, index: 1 },
    nlu_models: { type: Array, defaultValue: [] },
    'nlu_models.$': { type: String },
    updatedAt: {
        type: Date,
        optional: true,
        autoValue: () => new Date(),
        index: -1,
    },
    training: { type: Object, optional: true },
    'training.status': { type: String, allowedValues: ['success', 'failure'], optional: true },
    'training.instanceStatus': { type: String, allowedValues: ['training', 'notTraining', 'notReachable'], optional: true },
    'training.startTime': { type: Date, optional: true },
    'training.endTime': { type: Date, optional: true },
    'training.message': { type: String, optional: true },
    deploymentEnvironments: {
        type: Array,
        defaultValue: [],
    },
    'deploymentEnvironments.$': {
        type: String,
        allowedValues: ENVIRONMENT_OPTIONS.slice(1),
    },

    defaultDomain: { type: DefaultDomainSchema, optional: true },
    chatWidgetSettings: { type: chatWidgetSettingsSchema, optional: true },
    storyGroups: { type: Array, defaultValue: [] },
    'storyGroups.$': { type: String },
    logoUrl: { type: String, optional: true },
    smallLogoUrl: { type: String, optional: true },
    allowContextualQuestions: { type: Boolean, defaultValue: false },
}, { tracker: Tracker });

ProjectsSchema.messageBox.messages({
    en: {
        name: 'The name can only contain alphanumeric characters',
        invalidNamespace: 'The namespace must starts with \'bf-\' and can only contain letters, numbers and dashes (\'-\')',
    },
});
