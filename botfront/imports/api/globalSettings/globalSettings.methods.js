/* global Migrations */
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { formatError } from '../../lib/utils';
import { GlobalSettings } from './globalSettings.collection';
import { checkIfCan } from '../../lib/scopes';
import BotResponses from '../graphql/botResponses/botResponses.model';
import { indexStory } from '../story/stories.index';
import { indexBotResponse } from '../graphql/botResponses/mongo/botResponses';
import { Stories } from '../story/stories.collection';

if (Meteor.isServer) {
    Meteor.methods({
        'settings.save'(settings) {
            check(settings, Object);
            checkIfCan('global-admin');
            try {
                return GlobalSettings.update({ _id: 'SETTINGS' }, { $set: settings });
            } catch (e) {
                throw formatError(e);
            }
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
                const { textIndex, events } = indexStory(story);
                Stories.update({ _id: story._id }, { $set: { type: story.type, textIndex, events } });
            });
        },
        'settings.getMigrationStatus'() {
            // eslint-disable-next-line no-underscore-dangle
            const { locked, version } = Migrations._getControl();
            // eslint-disable-next-line no-underscore-dangle
            const latest = Migrations._list.length - 1;
            return { locked, version, latest };
        },
        'settings.unlockMigration' () {
            Migrations.unlock();
        },
    });
}
