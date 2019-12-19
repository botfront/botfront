import yaml from 'js-yaml';
import { StoryController } from './story_controller';
import { Stories } from '../api/story/stories.collection';
import { Projects } from '../api/project/project.collection';
import { Slots } from '../api/slots/slots.collection';
import { StoryGroups } from '../api/storyGroups/storyGroups.collection';
import { newGetBotResponses } from '../api/graphql/botResponses/mongo/botResponses';

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
        return story.branches || [];
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

export const findBranchById = (branchesN0, branchId) => {
    // recursive search of a branchId in the branches of a story
    // check if one of the child branch correspond to branchId
    const index = branchesN0.findIndex(branchesN1 => branchesN1._id === branchId);
    if (index !== -1) {
        return branchesN0[index];
    }
    // pass the child branches to itself to continue the search
    for (let i = 0; i < branchesN0.length; i += 1) {
        if (branchesN0[i].branches && branchesN0[i].branches.length > 0) {
            const branchesN1 = branchesN0[i].branches;
            const result = findBranchById(branchesN1, branchId);
            if (result !== -1) {
                return result;
            }
        }
    }
    /* if there is no more child branches or the searched branch was not found
    it's get checked for in the if just above */
    return -1;
};

export const addlinkCheckpoints = (stories) => {
    // adds rasa checkpoints to linked stories */

    const checkpointsToAdd = [];
    let checkpointsCounter = 0;
    /* prepend a given checkpoint title to each story with a link (has a checkpoint property)
    every checkpoint title is kept along its path to later append it to the origin story */
    const storiesCheckpointed = stories.map((story) => {
        if (story.checkpoints && story.checkpoints.length > 0) {
            let checkpoints = '';
            story.checkpoints.forEach((checkpoint) => {
                const existInStories = stories.findIndex(
                    aStory => aStory._id === checkpoint[0],
                );
                if (existInStories !== -1) {
                    const checkpointTitle = `checkpoint_${checkpointsCounter}`;
                    checkpoints = `> ${checkpointTitle}\n`.concat(checkpoints);
                    checkpointsToAdd.push({
                        checkpointTitle,
                        path: checkpoint,
                    });
                    checkpointsCounter += 1;
                }
            });
            return { ...story, story: checkpoints.concat(story.story) };
        }
        return story;
    });

    // append the correct checkpoint title to the end of the story/branch
    checkpointsToAdd.forEach((checkpoint) => {
        const originIndex = storiesCheckpointed.findIndex(
            story => story._id === checkpoint.path[0],
        );
        if (checkpoint.path.length === 1) {
            storiesCheckpointed[originIndex].story = storiesCheckpointed[
                originIndex
            ].story.concat(`\n> ${checkpoint.checkpointTitle}`);
        } else {
            const linkBranchId = checkpoint.path[checkpoint.path.length - 1];
            const branch = findBranchById(
                storiesCheckpointed[originIndex].branches,
                linkBranchId,
            );
            if (branch !== -1) {
                branch.story = branch.story.concat(`\n> ${checkpoint.checkpointTitle}`);
            }
        }
    });

    return storiesCheckpointed;
};

export const extractDomain = (stories, slots, templates = {}, defaultDomain = {}, crashOnStoryWithErrors = true) => {
    const initialDomain = {
        actions: new Set([...(defaultDomain.actions || []), ...Object.keys(templates)]),
        intents: new Set(defaultDomain.intents || []),
        entities: new Set(defaultDomain.entities || []),
        forms: new Set(defaultDomain.forms || []),
        templates: { ...(defaultDomain.templates || {}), ...templates },
        slots: defaultDomain.slots || {},
    };
    let domains = stories.map((story) => {
        try {
            // The ternary condition makes it work if we have an array of story object
            // Rather than an array of straight up strings.
            if (typeof story.story === 'string' ? story.story.trim() : story.trim()) {
                const val = new StoryController({
                    story: story.story ? story.story : story,
                    slots,
                    templates,
                });
                return val.extractDomain();
            }
            return {
                entities: [],
                intents: [],
                actions: [],
                forms: [],
                slots: [],
                templates: [],
            };
        } catch (e) {
            if (crashOnStoryWithErrors) {
                // Same thing than previous comment 20 lines up
                if (typeof story.title === 'string') {
                    throw new Error(`an error in the story ${story.title} has caused training to fail`);
                } else {
                    throw new Error('an error in a story has caused training to fail');
                }
            } else {
                return {
                    entities: [],
                    intents: [],
                    actions: [],
                    forms: [],
                    templates: {},
                    slots: {},
                };
            }
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
        initialDomain,
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

export const getAllTemplates = async (projectId, language = '') => {
    // fetches templates and turns them into nested key-value format
    const templates = await newGetBotResponses({ projectId, language });
    return templates.reduce((acc, curr) => {
        const { key, payload, ...rest } = curr;
        const content = { ...yaml.safeLoad(payload), ...rest };
        if (!(key in acc)) return { ...acc, [key]: [content] };
        return { ...acc, [key]: [...acc[key], content] };
    }, {});
};

export const getStoriesAndDomain = async (projectId, language) => {
    let { defaultDomain } = Projects.findOne({ _id: projectId }, { defaultDomain: 1 }) || { defaultDomain: { content: {} } };
    defaultDomain = yaml.safeLoad(defaultDomain.content);

    const selectedStoryGroupsIds = StoryGroups.find(
        { projectId, selected: true },
        { fields: { _id: 1 } },
    ).fetch().map(storyGroup => storyGroup._id);

    const stories = selectedStoryGroupsIds.length > 0
        ? Stories.find(
            { projectId, storyGroupId: { $in: selectedStoryGroupsIds } },
            {
                fields: {
                    story: 1, title: 1, branches: 1, errors: 1, checkpoints: 1,
                },
            },
        ).fetch()
        : Stories.find({ projectId }, {
            fields: {
                story: 1, title: 1, branches: 1, errors: 1, checkpoints: 1,
            },
        }).fetch();
    const storiesForDomain = stories
        .reduce((acc, story) => [...acc, ...flattenStory(story)], []);
    let storiesForRasa = stories
        .map(story => (story.errors && story.errors.length > 0 ? { ...story, story: '' } : story))
        .map(story => appendBranchCheckpoints(story));
    storiesForRasa = addlinkCheckpoints(storiesForRasa)
        .reduce((acc, story) => [...acc, ...flattenStory((story))], [])
        .map(story => `## ${story.title}\n${story.story}`);

    const templates = await getAllTemplates(projectId, language);
    const slots = Slots.find({ projectId }).fetch();
    return {
        stories: storiesForRasa.join('\n'),
        domain: extractDomain(storiesForDomain, slots, templates, defaultDomain),
    };
};

export const accumulateExceptions = (
    story,
    slots,
    templates = null,
    storyControllers,
    setStoryControllers,
    saveStoryMethod,
) => {
    const exceptions = {};
    const newStoryControllers = {};
    
    const traverseBranch = (currentStory, currentPath, isABranch = false) => {
        const currentPathAsString = currentPath.join();
        let currentController = null;
        if (!storyControllers[currentPathAsString]) {
            newStoryControllers[currentPathAsString] = new StoryController({
                story: currentStory.story || '',
                slots,
                onUpdate: content => saveStoryMethod(currentPath, { story: content }),
                templates,
                isABranch,
            });
            currentController = newStoryControllers[currentPathAsString];
        } else {
            currentController = storyControllers[currentPathAsString];
        }
        const currentErrors = currentController.getErrors();
        const currrentWarnings = currentController.getWarnings();
        let errors = [...currentErrors];
        let warnings = [...currrentWarnings];
        if (currentStory.branches) {
            currentStory.branches.forEach((branchStory) => {
                const childBranch = traverseBranch(
                    branchStory,
                    [...currentPath, branchStory._id],
                    true,
                );
                errors = [...errors, ...childBranch.errors];
                warnings = [...warnings, ...childBranch.warnings];
            });
        }
        exceptions[currentPathAsString] = { errors, warnings };
        return { errors, warnings };
    };

    traverseBranch(story, [story._id], false);
    setStoryControllers({
        ...storyControllers,
        ...newStoryControllers,
    });
    return exceptions;
};
