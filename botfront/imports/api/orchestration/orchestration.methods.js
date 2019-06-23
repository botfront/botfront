import { Meteor } from 'meteor/meteor';

if (Meteor.isServer) {
    Meteor.methods({
        'orchestration.type'() {
            return process.env.ORCHESTRATOR ? process.env.ORCHESTRATOR : 'docker-compose';
        },
    });
}
