/* eslint-disable camelcase */
import yaml from 'js-yaml';
import { Stories } from '../api/story/stories.collection';
import { Projects } from '../api/project/project.collection';
import { Slots } from '../api/slots/slots.collection';
import { StoryGroups } from '../api/storyGroups/storyGroups.collection';
import { newGetBotResponses } from '../api/graphql/botResponses/mongo/botResponses';

let storyAppLogger;
if (Meteor.isServer) {
    import { getAppLoggerForFile } from '../../server/logger';

    storyAppLogger = getAppLoggerForFile(__filename);
}

const getSlotsInRasaFormat = (slots = []) => {
    const slotsToAdd = {};
    slots.forEach((slot) => {
        const options = {};
        if (slot.minValue) options.min_value = slot.minValue;
        if (slot.maxValue) options.max_value = slot.maxValue;
        if (slot.initialValue) options.initial_value = slot.initialValue;
        if (slot.categories) options.values = slot.categories;
        slotsToAdd[slot.name] = {
            type: slot.type,
            ...options,
        };
    });
    return slotsToAdd;
};

export const stepsToYaml = steps => yaml.safeDump(steps || [])
    .replace(/^\[\]/, '')
    .replace(/\n$/, '');

export const storyReducer = (input, priorPath = '') => input.reduce((acc, { _id, branches = [], ...rest }) => {
    const path = priorPath ? `${priorPath},${_id}` : _id;
    return { ...acc, [path]: { ...rest, branches }, ...storyReducer(branches, path) };
}, {});

export const addCheckpoints = (fragments) => {
    const map = storyReducer(fragments);
    Object.keys(map).forEach((path) => {
        const story = map[path];
        // add link checkpoints
        const checkpoints = story.checkpoints || [];
        if (checkpoints.length) {
            const checkpoint = `link-to-${story.title}/${story._id}`;
            map[path].steps = [{ checkpoint }, ...(story.steps || [])];
            checkpoints.forEach((checkpointPath) => {
                map[checkpointPath.join()].steps = [
                    ...(map[checkpointPath.join()].steps || []),
                    { checkpoint },
                ];
            });
        }
        // change title
        const title = path
            .split()
            .map((_, i, src) => map[src.slice(0, i + 1).join()].title)
            .join('__');
        map[path].title = title;
        // add branch checkpoints
        const branches = story.branches || [];
        if (branches.length) {
            const checkpoint = `${title.replace(/ /g, '_')}__branches`;
            map[path].steps = [...(story.steps || []), { checkpoint }];
        }
    });
    return Object.values(map).map(({ branches: _, checkpoints: __, ...rest }) => rest);
};

const scrapeActionsIntentsAndEntities = (el) => {
    if (Array.isArray(el)) return el.flatMap(scrapeActionsIntentsAndEntities);
    if (el && typeof el === 'object') {
        return Object.keys(el).flatMap((k) => {
            if (k === 'action' && el[k].indexOf('utter_') !== 0) { return [{ action: el[k] }]; }
            if (k === 'intent') return [{ intent: el[k] }];
            if (k === 'entities') {
                return el[k].map(entity => ({ entity: Object.keys(entity)[0] }));
            }
            return {};
        });
    }
    return [];
};

export const extractDomain = ({
    fragments = [],
    slots = [],
    forms = {},
    responses = {},
    defaultDomain = {},
}) => {
    const initialDomain = {
        actions: new Set(defaultDomain.actions || []),
        intents: new Set(defaultDomain.intents || []),
        entities: new Set(defaultDomain.entities || []),
        responses: { ...(defaultDomain.responses || {}), ...responses },
        slots: { ...(defaultDomain.slots || {}), ...getSlotsInRasaFormat(slots) },
        forms: { ...(defaultDomain.forms || {}), ...forms },
    };
    const domain = fragments.reduce((acc, frag) => {
        const newEls = scrapeActionsIntentsAndEntities([frag.steps, frag.condition]);
        newEls.forEach(({ action, intent, entity }) => {
            if (action) acc.actions.add(action);
            if (intent) acc.intents.add(intent);
            if (entity) acc.entities.add(entity);
        });
        return acc;
    }, initialDomain);
    domain.actions = Array.from(domain.actions);
    domain.intents = Array.from(domain.intents);
    domain.entities = Array.from(domain.entities);
    return domain;
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

export const getFragmentsAndDomain = async (projectId, language) => {
    const appMethodLogger = storyAppLogger.child({
        method: 'getFragmentsAndDomain',
        args: { projectId, language },
    });
    appMethodLogger.debug('Retrieving default domain');
    const { defaultDomain, defaultLanguage } = getDefaultDomainAndLanguage(projectId);

    defaultDomain.slots = {
        ...(defaultDomain.slots || {}),
        fallback_language: { type: 'unfeaturized', initial_value: defaultLanguage },
    };
    appMethodLogger.debug('Selecting fragment groups');
    const groups = StoryGroups.find(
        { projectId, smartGroup: { $exists: false } },
        { fields: { _id: 1, name: 1, selected: 1 } },
    ).fetch();

    const selectedGroups = groups.filter(g => g.selected).length
        ? groups.filter(g => g.selected).length
        : groups;

    appMethodLogger.debug('Fetching fragments');
    const allFragments = Stories.find({
        projectId,
        storyGroupId: { $in: selectedGroups.map(({ _id }) => _id) },
    }).fetch();

    appMethodLogger.debug('Generating domain');
    const responses = await getAllResponses(projectId, language);
    const slots = Slots.find({ projectId }).fetch();
    const domain = extractDomain({
        fragments: allFragments,
        slots,
        responses,
        defaultDomain,
    });

    appMethodLogger.debug('Adding checkpoints to stories');
    const fragmentsWithCheckpoints = addCheckpoints(allFragments);

    return {
        stories: fragmentsWithCheckpoints
            .filter(({ type }) => type === 'story')
            .map(({ storyGroupId, title: story, steps }) => ({
                story,
                steps,
                metadata: { group: groups.find(g => g._id === storyGroupId)?.name },
            })),
        rules: fragmentsWithCheckpoints
            .filter(({ type }) => type === 'rule')
            .map(({
                storyGroupId, title: rule, condition, steps, conversation_start, wait_for_user_input,
            }) => ({
                rule,
                condition,
                steps,
                ...(conversation_start ? { conversation_start } : {}),
                ...(!wait_for_user_input ? { wait_for_user_input } : {}),
                metadata: { group: groups.find(g => g._id === storyGroupId)?.name },
            })),
        domain,
        wasPartial: groups.length !== selectedGroups.length,
    };
};
