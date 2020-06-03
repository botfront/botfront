import yaml from 'js-yaml';
import { StoryController } from './story_controller';
import { Stories } from '../api/story/stories.collection';
import { Projects } from '../api/project/project.collection';
import { Slots } from '../api/slots/slots.collection';
import { StoryGroups } from '../api/storyGroups/storyGroups.collection';
import { newGetBotResponses } from '../api/graphql/botResponses/mongo/botResponses';
import { getForms } from '../api/graphql/forms/mongo/forms';

let storyAppLogger;
let getAppLoggerForMethodExport;
if (Meteor.isServer) {
    import { getAppLoggerForMethod, getAppLoggerForFile } from '../../server/logger';

    getAppLoggerForMethodExport = getAppLoggerForMethod;
    storyAppLogger = getAppLoggerForFile(__filename);
}

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
                    branches: accumulateur.branches[index].branches
                        ? [...accumulateur.branches[index].branches]
                        : [],
                    story: accumulateur.branches[index].story,
                    title: accumulateur.branches[index].title,
                    // Indices are the path in numeric form, for instance, the second branch into the first branch
                    // would hae the indices looking like [0, 1], so first branch then second branch.
                    indices: [...accumulateur.indices, index],
                    path: [...accumulateur.path, accumulateur.branches[index]._id],
                    pathTitle: [
                        ...accumulateur.pathTitle,
                        accumulateur.branches[index].title,
                    ],
                };
            } catch (e) {
                throw new Error(
                    `Could not access ${accumulateur.path.join()},${value}`,
                );
            }
        },
        {
            branches: story.branches ? [...story.branches] : [],
            story: story.story,
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

export const getStartingPayload = storyContent => (
    storyContent.split('\n')[0].substring(2).trim()
);

export const insertSmartPayloads = (story) => {
    if (!story.rules || !story.rules.length) return story;
    const updatedStory = story;
    const hasStartingPayload = /^\*/.test(story.story);
    let newPayload = hasStartingPayload ? getStartingPayload(story.story) : '';

    const additionalPayloads = new Set();

    story.rules.forEach((rules) => {
        if (!rules.trigger) return;
        const payloadName = rules.payload.substring(1);
        if (!rules.trigger.queryString) {
            additionalPayloads.add(payloadName);
            return;
        }
        const entityList = [];
        rules.trigger.queryString.forEach((queryString) => {
            if (queryString.sendAsEntity) {
                entityList.push(`"${queryString.param}":"${queryString.param}"`);
            }
        });
        if (entityList.length > 0) additionalPayloads.add(`${payloadName}{${entityList.join(',')}}`);
        else additionalPayloads.add(payloadName);
    });

    additionalPayloads.delete(newPayload);
    additionalPayloads.forEach((payload) => {
        if (newPayload.length === 0) {
            newPayload = payload;
            return;
        }
        newPayload += ` OR ${payload}`;
    });
    if (hasStartingPayload) {
        // For this one we need not update it.
        updatedStory.story = `* ${newPayload}\n${(story.story || '').split('\n').slice(1).join('\n') || ''}`;
    } else {
        updatedStory.story = `* ${newPayload}\n${story.story || ''}`;
    }
    return updatedStory;
};

export const appendBranchCheckpoints = (nLevelStory, remainder = '') => ({
    /*  this adds trailing and leading checkpoints to a story with a branch structure of arbitrary shape.
        {Parent body} turns into {Parent body\n> Parent title__branches} and {Child body} turns into
        {> Parent title__branches\nChild body}.

        Nested titles are also renamed to avoid name conflicts: {Child title} turns into
        {Parent title__Child title}. The process is recursive, depth-first. The second argument
        'remainder' is used to keep track of title prefix. In this example, remainder = 'Parent title'.
    */
    ...nLevelStory,
    story:
        nLevelStory.branches && nLevelStory.branches.length
            ? `${nLevelStory.story || ''}\n\
> ${remainder ? `${remainder.replace(/ /g, '_')}__` : ''}${nLevelStory.title.replace(
        / /g,
        '_',
    )}__branches`
            : nLevelStory.story || '',
    title: `${remainder ? `${remainder}__` : ''}${nLevelStory.title}`,
    branches:
        nLevelStory.branches && nLevelStory.branches.length
            ? nLevelStory.branches.map(n1LevelStory => appendBranchCheckpoints(
                {
                    ...n1LevelStory,
                    story: `> ${
                        remainder ? `${remainder.replace(/ /g, '_')}__` : ''
                    }${nLevelStory.title.replace(/ /g, '_')}__branches\n\
${n1LevelStory.story || ''}`,
                },
                `${remainder ? `${remainder}__` : ''}${nLevelStory.title}`,
            ))
            : [],
});

export const flattenStory = story => (story.branches || []).reduce(
    (acc, val) => [...acc, ...flattenStory(val)],
    [{ story: story.story || '', title: story.title }],
);

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
            storiesCheckpointed[originIndex].story = (
                storiesCheckpointed[originIndex].story || ''
            ).concat(`\n> ${checkpoint.checkpointTitle}`);
        } else {
            const linkBranchId = checkpoint.path[checkpoint.path.length - 1];
            const branch = findBranchById(
                storiesCheckpointed[originIndex].branches,
                linkBranchId,
            );
            if (branch !== -1) {
                branch.story = (branch.story || '').concat(
                    `\n> ${checkpoint.checkpointTitle}`,
                );
            }
        }
    });

    return storiesCheckpointed;
};

export const extractDomain = ({
    stories,
    slots,
    responses = {},
    defaultDomain = {},
    bfForms = [],
    crashOnStoryWithErrors = true,
}) => {
    // extractDomain can be called from outside a Meteor method so Meteor.userId() might not be available
    let userId;
    try {
        userId = Meteor.userId();
    } catch (error) {
        userId = 'Can not get userId here';
    }
    const appMethodLogger = getAppLoggerForMethodExport(
        storyAppLogger,
        'extractDomain',
        userId,
        {
            stories,
            slots,
            responses,
            defaultDomain,
            crashOnStoryWithErrors,
        },
    );
    const initialDomain = {
        actions: new Set([...(defaultDomain.actions || []), ...Object.keys(responses)]),
        intents: new Set(defaultDomain.intents || []),
        entities: new Set(defaultDomain.entities || []),
        forms: new Set(defaultDomain.forms || []),
        responses: { ...(defaultDomain.responses || {}), ...responses },
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
                    triggerRules: story.rules,
                });
                return val.extractDomain();
            }
            return {
                entities: [],
                intents: [],
                actions: [],
                forms: [],
                slots: {},
            };
        } catch (e) {
            if (crashOnStoryWithErrors) {
                // Same thing than previous comment 20 lines up
                if (typeof story.title === 'string') {
                    appMethodLogger.error(
                        `an error in the story ${story.title} has caused training to fail: ${e}`,
                    );
                    throw new Error(
                        `an error in the story ${story.title} has caused training to fail`,
                    );
                } else {
                    appMethodLogger.error(
                        `an error in a story has caused training to fail: ${e}`,
                    );
                    throw new Error('an error in a story has caused training to fail');
                }
            } else {
                return {
                    entities: [],
                    intents: [],
                    actions: [],
                    forms: [],
                    slots: {},
                };
            }
        }
    });
    appMethodLogger.debug('merging domains');
    domains = domains.reduce(
        (d1, d2) => ({
            entities: new Set([...d1.entities, ...d2.entities]),
            intents: new Set([...d1.intents, ...d2.intents]),
            actions: new Set([...d1.actions, ...d2.actions]),
            forms: new Set([...d1.forms, ...d2.forms]),
            slots: { ...d1.slots, ...d2.slots },
            responses: d1.responses,
        }),
        initialDomain,
    );
    appMethodLogger.debug('converting domain to yaml');
    domains = yaml.safeDump({
        entities: Array.from(domains.entities),
        intents: Array.from(domains.intents),
        actions: Array.from(domains.actions),
        forms: Array.from(domains.forms),
        responses: domains.responses,
        slots: domains.slots,
        ...(bfForms.length ? { bf_forms: bfForms } : {}),
    });
    return domains;
};

export const getAllResponses = async (projectId, language = '') => {
    // fetches responses and turns them into nested key-value format
    const responses = await newGetBotResponses({ projectId, language });
    return responses.reduce((acc, curr) => {
        const { key, payload, ...rest } = curr;
        const content = { ...yaml.safeLoad(payload), ...rest };
        if (!(key in acc)) return { ...acc, [key]: [content] };
        return { ...acc, [key]: [...acc[key], content] };
    }, {});
};

export const getDefaultDomainAndLanguage = (projectId) => {
    const { defaultDomain: yamlDDomain, defaultLanguage } = Projects.findOne(
        { _id: projectId },
        { defaultDomain: 1, defaultLanguage: 1 },
    );
    const defaultDomain = yaml.safeLoad(yamlDDomain.content) || {};
    return { defaultDomain, defaultLanguage };
};


export const generateAndFormatStories = (stories, storyGroups) => {
    const storiesBySG = addlinkCheckpoints(stories).reduce(
        (acc, curr) => ({
            ...acc,
            [curr.storyGroupId]: [...(acc[curr.storyGroupId] || []), curr],
        }),
        {},
    );

    const formatedStories = [];
    storyGroups.forEach(({ _id, name }) => {
        const storiesForThisSG = (storiesBySG[_id] || [])
            .map(story => appendBranchCheckpoints(story))
            .map(story => insertSmartPayloads(story))
            .reduce((acc, story) => [...acc, ...flattenStory(story)], [])
            .map(story => `## ${story.title}\n${story.story}`)
            .join('\n');
        formatedStories.push(`# ${name}\n\n${storiesForThisSG}`);
    });
    return formatedStories;
};

export const getStoriesAndDomain = async (projectId, language, env = 'development') => {
    const appMethodLogger = storyAppLogger.child({
        method: 'getStoriesAndDomain',
        args: { projectId, language },
    });
    appMethodLogger.debug('Retrieving default domain');
    const { defaultDomain, defaultLanguage } = getDefaultDomainAndLanguage(projectId);

    defaultDomain.slots = {
        ...(defaultDomain.slots || {}),
        fallback_language: { type: 'unfeaturized', initial_value: defaultLanguage },
    };
    appMethodLogger.debug('Selecting story groups');
    const storyGroups = StoryGroups.find(
        { projectId, smartGroup: { $exists: false } },
        { fields: { _id: 1, name: 1, selected: 1 } },
    ).fetch();

    let selectedStoryGroups;
    if (env === 'development') {
        selectedStoryGroups = storyGroups.filter(sg => sg.selected);
        selectedStoryGroups = selectedStoryGroups.length
            ? selectedStoryGroups
            : storyGroups;
    } else {
        selectedStoryGroups = storyGroups;
    }

    appMethodLogger.debug('Fetching stories');
    const status = env === 'development' ? {} : { status: 'published' };
    const allStories = Stories.find(
        { projectId, storyGroupId: { $in: selectedStoryGroups.map(({ _id }) => _id) }, ...status },
        {
            fields: {
                story: 1,
                title: 1,
                branches: 1,
                errors: 1,
                checkpoints: 1,
                storyGroupId: 1,
                rules: 1,
            },
        },
    ).fetch();

    appMethodLogger.debug('Fetching forms');
    const bfForms = (await getForms(projectId))
        .map(({
            _id, projectId: pid, pinned, isExpanded, ...rest
        }) => rest);

    appMethodLogger.debug('Generating domain');
    const responses = await getAllResponses(projectId, language);
    const slots = Slots.find({ projectId }).fetch();
    const domain = extractDomain({
        stories: allStories.reduce((acc, story) => [...acc, ...flattenStory(story)], []),
        slots,
        responses,
        defaultDomain,
        bfForms,
    });

    appMethodLogger.debug('Formatting stories');
    const stories = generateAndFormatStories(allStories, selectedStoryGroups);

    return {
        stories,
        domain,
    };
};

export const accumulateExceptions = (
    story,
    slots,
    storyControllers,
    setStoryControllers,
    saveStoryMethod,
    setLastMdTypeMethod,
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
                onMdType: setLastMdTypeMethod,
                isABranch,
                triggerRules: currentStory.rules,
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

export const getStoryEvents = (md) => {
    let events = [];
    try {
        const lines = md.split('\n');
        lines.forEach((line) => {
            const [prefix, content] = /(^ *\* |^ *- )(.*)/.exec(line).slice(1, 3);
            if (
                prefix.trim() === '-'
                && (content.match(/^utter_/) || content.match(/^action_/))
            ) {
                events = [...events, content];
            }
        });
    } catch (err) {
        /*
        if there is an error, skip the story. this should only happen
        when the story is empty with the error: "md.split is not a function"
        */
    }
    return events;
};

export const aggregateEvents = (parentStory, update = {}) => {
    /*
    create an array of "utter_" and "action_" events in a story and it's child branches

    the update will merge with the parentStory when branch._id or story._id is equal to update._id.
    update._id should be a branchId or storyId

    for example if the update object has a branches property
    it will replace the branches of the story at the given _id with the branches in the update object
    */
    let events = [];
    const traverseBranches = (incommingStory) => {
        const story = incommingStory._id === update._id
            ? { ...incommingStory, ...update }
            : incommingStory;
        events = Array.from(new Set([...events, ...getStoryEvents(story.story)]));
        // events = [...events, ...getStoryEvents(story.story, events)];
        if (story.branches) {
            story.branches.forEach(branch => traverseBranches(branch));
        }
    };
    traverseBranches(parentStory);
    return events;
};
