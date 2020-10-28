import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import {
    loadBotfrontConfig, loadRasaConfig, loadConversations, loadIncoming, loadEndpoints, loadCredentials,
} from './loadMisc';
import {
    badStories, storyGroupOne, storyGroupOneParsed, storyGroupTwoParsed, storyGroups, storiesGenerated,
} from './loads.tests.data';


if (Meteor.isServer) {
    describe('loadBotfrontConfig', () => {
        it('should raise error on deviant input format', () => {
           
        });
        it('should raise error when config keys are missing', () => {
           
        });
        it('should raise error when bad key is in the config', () => {
           
        });
    });
    describe('loadRasaConfig', () => {
        it('should raise error on deviant input format', () => {
           
        });
        it('should raise error when config key are missing', () => {
           
        });
        it('should raise error when bad key is in the config', () => {
           
        });
    });
}
