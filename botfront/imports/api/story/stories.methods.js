import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Stories } from './stories.collection';

export const checkStoryNotEmpty = story => story.story && !!story.story.replace(/\s/g, '').length;

Meteor.methods({
    'stories.insert'(story) {
        check(story, Object);
        return Stories.insert(story);
    },

    'stories.update'(story) {
        check(story, Object);
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

    'stories.updateBranch'(story, branchPath, newContent) {
        check(story, Object);
        check(branchPath, String);
        check(newContent, String);
        const storyInDatabase = Stories.findOne({ _id: story._id });
        if (!story) throw new Meteor.Error('404', 'Story not found!');

        const { indices } = branchPath
            .split('__')
            .slice(1)
        // gets branches but also indices, useful for setting later
            .reduce(
                (accumulateur, value) => {
                    const index = accumulateur.branches.findIndex(
                        branch => branch._id === value,
                    );
                    return {
                        branches: accumulateur.branches[index].branches ? [...accumulateur.branches[index].branches] : [],
                        // Indices are the path in numeric form, for instance, the second branch into the first branch
                        // would hae the indices looking like [0, 1], so first branch then second branch.
                        indices: [...accumulateur.indices, index],
                    };
                },
                {
                    branches: storyInDatabase.branches ? [...storyInDatabase.branches] : [],
                    indices: [],
                },
            );
        let pathToValue = '';
        indices.forEach((indice) => {
            pathToValue = pathToValue.concat(`branches.${indice}.`);
        });
        pathToValue = pathToValue.concat('story');
        return Stories.update(storyInDatabase, { $set: { [pathToValue]: newContent } }, { upsert: true });
    },

    'stories.delete'(story) {
        check(story, Object);
        return Stories.remove(story);
    },

    'stories.getStories'(projectId) {
        check(projectId, String);
        return Stories.find({ projectId }).fetch();
    },
});
