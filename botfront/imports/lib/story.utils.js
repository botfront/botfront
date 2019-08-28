import yaml from 'js-yaml';
import { extractDomain } from './story_controller';
import { Stories } from '../api/story/stories.collection';
import { Slots } from '../api/slots/slots.collection';
import { StoryGroups } from '../api/storyGroups/storyGroups.collection';
import { CorePolicies } from '../api/core_policies';

export const traverseStory = (story, path) => path
    .split('__')
    .slice(1)
    // gets branches but also indices, useful for setting later
    .reduce(
        (accumulateur, value) => {
            try {
                const index = accumulateur.branches.findIndex(
                    branch => branch._id === value,
                );
                return {
                    branches: accumulateur.branches[index].branches ? [...accumulateur.branches[index].branches] : [],
                    story: accumulateur.branches[index].story,
                    title: accumulateur.branches[index].title,
                    // Indices are the path in numeric form, for instance, the second branch into the first branch
                    // would hae the indices looking like [0, 1], so first branch then second branch.
                    indices: [...accumulateur.indices, index],
                    path: `${accumulateur.path}__${ // the path as a double__underscore-separated string of IDs
                        accumulateur.branches[index]._id
                    }`,
                    pathTitle: `${accumulateur.pathTitle}__${ // the path as a double__underscore-separated string of titles
                        accumulateur.branches[index].title
                    }`,
                };
            } catch (e) {
                throw new Error(`Could not access ${accumulateur.path}__${value}`);
            }
        },
        {
            branches: story.branches ? [...story.branches] : [],
            story,
            title: story.title,
            indices: [],
            path: story._id,
            pathTitle: story.title,
        },
    );

export const appendBranchCheckpoints = (nLevelStory, remainder = '') => ({
    /*  this adds trailing and leading checkpoints to a story with a branch structure of arbitrary shape.
        {Parent body} turns into {Parent body\n> Parent title__branches} and {Child body} turns into
        {> Parent title__branches\nChild body}.
        
        Nested titles are also renamed to avoid name conflicts: {Child title} turns into
        {Parent title__Child title}. The process is recursive, depth-first. The second argument
        'remainder' is used to keep track of title prefix. In this example, remainder = 'Parent title'.
    */
    ...nLevelStory,
    story: (nLevelStory.branches && nLevelStory.branches.length)
        ? `${nLevelStory.story || ''}\n\
> ${remainder ? `${remainder.replace(' ', '_')}__` : ''}${nLevelStory.title.replace(' ', '_')}__branches`
        : nLevelStory.story || '',
    title: `${remainder ? `${remainder}__` : ''}${nLevelStory.title}`,
    branches: (nLevelStory.branches && nLevelStory.branches.length)
        ? nLevelStory.branches.map(n1LevelStory => (
            appendBranchCheckpoints({
                ...n1LevelStory,
                story: `> ${remainder ? `${remainder.replace(' ', '_')}__` : ''}${nLevelStory.title.replace(' ', '_')}__branches\n\
${n1LevelStory.story || ''}`,
            }, `${remainder ? `${remainder}__` : ''}${nLevelStory.title}`)
        ))
        : [],
});

export const flattenStory = story => (story.branches || []).reduce((acc, val) => (
    // this collects all nested branches of a story into a flat array
    [...acc, ...flattenStory(val)]
), [{ story: (story.story || ''), title: story.title }]);

const getMappingStory = (policies) => {
    const mappingTriggers = policies
        .filter(policy => policy.name.includes('BotfrontMappingPolicy'))
        .map(policy => policy.triggers.map((trigger) => {
            if (!trigger.extra_actions) return [trigger.action];
            return [...trigger.extra_actions, trigger.action];
        }))
        .reduce((coll, curr) => coll.concat(curr), [])
        .reduce((coll, curr) => coll.concat(curr), []);
    return mappingTriggers.length
        ? `* mapping_intent\n - ${mappingTriggers.join('\n  - ')}`
        : '';
};

export const getStoriesAndDomain = (projectId) => {
    const { policies } = yaml.safeLoad(CorePolicies.findOne({ projectId }, { policies: 1 }).policies);
    const mappingStory = getMappingStory(policies);

    const selectedStoryGroupsIds = StoryGroups.find(
        { projectId, selected: true },
        { fields: { _id: 1 } },
    ).fetch().map(storyGroup => storyGroup._id);

    const stories = selectedStoryGroupsIds.length > 0
        ? Stories.find(
            { projectId, storyGroupId: { $in: selectedStoryGroupsIds } },
            { fields: { story: 1, title: 1, branches: 1 } },
        ).fetch()
        : Stories.find({ projectId }, { fields: { story: 1, title: 1, branches: 1 } }).fetch();

    const storiesForDomain = stories
        .reduce((acc, story) => [...acc, ...flattenStory(story)], [])
        .map(story => story.story);
    const storiesForRasa = stories
        .reduce((acc, story) => [...acc, ...flattenStory(appendBranchCheckpoints(story))], [])
        .map(story => `## ${story.title}\n${story.story}`);

    if (mappingStory.length) {
        storiesForDomain.push(mappingStory); storiesForRasa.push(`## mapping_story\n${mappingStory}`);
    }

    const slots = Slots.find({ projectId }).fetch();
    return {
        stories: storiesForRasa.join('\n'),
        domain: extractDomain(storiesForDomain, slots),
    };
};