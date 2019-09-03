import yaml from 'js-yaml';
import { StoryController } from './story_controller';
import { Stories } from '../api/story/stories.collection';
import { Slots } from '../api/slots/slots.collection';
import { StoryGroups } from '../api/storyGroups/storyGroups.collection';
import { CorePolicies } from '../api/core_policies';

export const traverseStory = (story, path) => path
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
                    path: [...accumulateur.path, accumulateur.branches[index]._id],
                    pathTitle: [...accumulateur.pathTitle, accumulateur.branches[index].title],
                };
            } catch (e) {
                throw new Error(`Could not access ${accumulateur.path.join()},${value}`);
            }
        },
        {
            branches: story.branches ? [...story.branches] : [],
            story,
            title: story.title,
            indices: [],
            path: [story._id],
            pathTitle: [story.title],
        },
    );

export function getSubBranchesForPath(story, path) {
    if (!path.length) {
        throw new Error('path should be at least of length 1');
    } else if (path.length === 1) {
        return story.branches;
    } else {
        const deepPath = [...path].slice(1, path.length);
        let deepStory = { ...story };
        let branches = [...deepStory.branches];
        try {
            
            deepPath.forEach((id) => {
                let found = false;
                branches.forEach((branch) => {
                    if (branch._id === id) {
                        found = true;
                        deepStory = { ...branch };
                        branches = [...deepStory.branches];
                    }
                });
                if (!found) throw new Error();
            });
            return branches;
        } catch (e) {
            throw new Error('the story did not match the given path');
        }
    }
}

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

const getMappingTriggers = policies => policies
    .filter(policy => policy.name.includes('BotfrontMappingPolicy'))
    .map(policy => policy.triggers.map((trigger) => {
        if (!trigger.extra_actions) return [trigger.action];
        return [...trigger.extra_actions, trigger.action];
    }))
    .reduce((coll, curr) => coll.concat(curr), [])
    .reduce((coll, curr) => coll.concat(curr), []);

export const extractDomain = (stories, slots) => {
    const defaultDomain = {
        actions: new Set(),
        intents: new Set(),
        entities: new Set(),
        forms: new Set(),
        templates: new Set(),
        slots: {
            latest_response_name: { type: 'unfeaturized' },
            followup_response_name: { type: 'unfeaturized' },
            parse_data: { type: 'unfeaturized' },
            disambiguation_message: { type: 'unfeaturized' },
        },
    };
    let domains = stories.map((story) => {
        const val = new StoryController(story, slots);
        val.validateStory();
        try {
            return val.extractDomain();
        } catch (e) {
            return {
                entities: [], intents: [], actions: [], forms: [], templates: [], slots: [],
            };
        }
    });
    domains = domains.reduce(
        (d1, d2) => ({
            entities: new Set([...d1.entities, ...d2.entities]),
            intents: new Set([...d1.intents, ...d2.intents]),
            actions: new Set([...d1.actions, ...d2.actions]),
            forms: new Set([...d1.forms, ...d2.forms]),
            templates: { ...d1.templates, ...d2.templates },
            slots: { ...d1.slots, ...d2.slots },
        }),
        defaultDomain,
    );
    domains = yaml.safeDump({
        entities: Array.from(domains.entities),
        intents: Array.from(domains.intents),
        actions: Array.from(domains.actions),
        forms: Array.from(domains.forms),
        templates: domains.templates,
        slots: domains.slots,
    });
    return domains;
};

export const getStoriesAndDomain = (projectId) => {
    const { policies } = yaml.safeLoad(CorePolicies.findOne({ projectId }, { policies: 1 }).policies);
    const mappingTriggers = getMappingTriggers(policies);
    const extraDomain = `* deny_suggestions\n\
 - action_botfront_disambiguation\n\
 - action_botfront_disambiguation_followup\n\
 - action_botfront_disambiguation_denial\n\
 - action_botfront_fallback\n\
${mappingTriggers.length
        ? `* mapping_intent\n - ${mappingTriggers.join('\n  - ')}`
        : ''
}`;

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
        .map(story => story.story)
        .concat([extraDomain]);
    const storiesForRasa = stories
        .reduce((acc, story) => [...acc, ...flattenStory(appendBranchCheckpoints(story))], [])
        .map(story => `## ${story.title}\n${story.story}`);

    const slots = Slots.find({ projectId }).fetch();
    return {
        stories: storiesForRasa.join('\n'),
        domain: extractDomain(storiesForDomain, slots),
    };
};
