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
    const getMigrationStatus = () => {
        // eslint-disable-next-line no-underscore-dangle
        const { locked, version } = Migrations._getControl();
        // eslint-disable-next-line no-underscore-dangle
        const latest = Migrations._list.length - 1;
        return { locked, version, latest };
    };

    Meteor.publish('isMigrating', function () {
        // eslint-disable-next-line no-underscore-dangle
        const handle = Migrations._collection._collection.find({}).observeChanges({
            changed: () => {
                const { locked, version, latest } = getMigrationStatus();
                this.changed('migrationStatus', 'global', {
                    isMigrating: !locked && version > 0 && version < latest,
                });
            },
        });

        const { locked, version, latest } = getMigrationStatus();
        this.added('migrationStatus', 'global', {
            isMigrating: !locked && version > 0 && version < latest,
        });
        this.ready();

        this.onStop(() => handle.stop());
    });

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
                        BotResponses.updateOne(
                            { _id: botResponse._id },
                            { textIndex },
                        ).exec();
                    });
                });
            const allStories = Stories.find().fetch();
            allStories.forEach((story) => {
                const { textIndex } = indexStory(story);
                Stories.update({ _id: story._id }, { $set: { textIndex } });
            });
        },
        'settings.getMigrationStatus'() {
            return getMigrationStatus();
        },
        'settings.unlockMigration'() {
            Migrations.unlock();
        },
    });
}
