import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';
import { Stories } from './stories.collection';

export const checkStoryNotEmpty = story => story.story && !!story.story.replace(/\s/g, '').length;

Meteor.methods({
    'stories.insert'(story) {
        check(story, Object);
        checkIfCan('stories:w', story.projectId);
        return Stories.insert(story);
    },

    'stories.update'(story) {
        check(story, Object);
        checkIfCan('stories:w', story.projectId);
        const { _id, indices, ...rest } = story;
        const update = indices && indices.length
            ? Object.assign(
                {},
                ...Object.keys(rest).map(key => (
                    { [`branches.${indices.join('.branches.')}.${key}`]: rest[key] }
                )),
            )
            : rest;
        return Stories.update({ _id }, { $set: update });
    },

    'stories.delete'(story) {
        check(story, Object);
        checkIfCan('stories:w', story.projectId);
        return Stories.remove(story);
    },

    'stories.getStories'(projectId) {
        check(projectId, String);
        checkIfCan('stories:r', projectId);
        return Stories.find({ projectId }).fetch();
    },
});
