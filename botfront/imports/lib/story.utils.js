/* eslint-disable camelcase */
import yaml from 'js-yaml';
import { Stories } from '../api/story/stories.collection';
import { Projects } from '../api/project/project.collection';
import { Slots } from '../api/slots/slots.collection';
import { StoryGroups } from '../api/storyGroups/storyGroups.collection';
import { cleanPayload, insertSmartPayloads } from './client.safe.utils';
import { newGetBotResponses } from '../api/graphql/botResponses/mongo/botResponses';
import { getForms } from '../api/graphql/forms/mongo/forms';
import { exportRQABToPypred } from './pypred/pypred.utils';

let storyAppLogger;
if (Meteor.isServer) {
    import { getAppLoggerForFile } from '../../server/logger';

    storyAppLogger = getAppLoggerForFile(__filename);
}

// used a random string of chars, this way there are negligeable odds that the user would use the same intent
export const USER_LINE_EDIT_MODE = 'Zx4qXKVdT5P3';

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

export { insertSmartPayloads };

export const stepsToYaml = steps => yaml
    .safeDump(steps || [])
    .replace(/^\[\]/, '')
    .replace(/\n$/, '');

export const storyReducer = (input, priorPath = '', priorGroupId = '') => input.reduce((acc, {
    _id, branches = [], storyGroupId: currentGid, ...rest
}) => {
    const storyGroupId = currentGid || priorGroupId;
    const path = priorPath ? `${priorPath},${_id}` : _id;
    return {
        ...acc,
        [path]: {
            ...rest,
            _id,
            storyGroupId,
            branches,
        },
        ...storyReducer(branches, path, storyGroupId),
    };
}, {});

export const addCheckpoints = (fragments) => {
    const map = storyReducer(fragments);
    Object.keys(map).forEach((path) => {
        const story = map[path];
        // add link checkpoints
        const checkpoints = story.checkpoints || [];
        if (checkpoints.length) {
            const checkpoint = `link-to-${story.title}/${story._id}`;
            map[path].steps = [
                { checkpoint },
                ...(story.steps || [{ action: 'action_empty_branch' }]),
            ];
            checkpoints.forEach((checkpointPath) => {
                map[checkpointPath.join()].steps = [
                    ...(map[checkpointPath.join()].steps || [
                        { action: 'action_empty_branch' },
                    ]),
                    { checkpoint },
                ];
            });
        }
        const resolvedPath = path
            .split(',')
            .map(
                (_, i, src) => map[src.slice(0, i + 1).join()].originalTitle
                    || map[src.slice(0, i + 1).join()].title,
            );
        // change title
        map[path].originalTitle = map[path].title;
        map[path].title = resolvedPath.join('__');
        // add branch origin checkpoints
        if (resolvedPath.length > 1) {
            const checkpoint = `${resolvedPath
                .slice(0, resolvedPath.length - 1)
                .join('__')
                .replace(/ /g, '_')}__branches`;
            map[path].steps = [
                { checkpoint },
                ...(story.steps || [{ action: 'action_empty_branch' }]),
            ];
        }
        // add branch destination checkpoints
        if ((story.branches || []).length) {
            const checkpoint = `${resolvedPath.join('__').replace(/ /g, '_')}__branches`;
            map[path].steps = [
                ...(story.steps || [{ action: 'action_empty_branch' }]),
                { checkpoint },
            ];
        }
    });
    return Object.values(map).map(
        ({
            branches: _, checkpoints: __, originalTitle: ___, _id: ____, ...rest
        }) => rest,
    );
};

const scrapeActionsIntentsAndEntities = (el, exclude = []) => {
    if (Array.isArray(el)) {
        return el.flatMap(c => scrapeActionsIntentsAndEntities(c, exclude));
    }
    if (el && typeof el === 'object') {
        return Object.keys(el).flatMap((k) => {
            if (k === 'action' && !exclude.includes(el[k])) {
                return [{ action: el[k] }];
            }
            if (k === 'intent') return [{ intent: el[k] }];
            if (k === 'entities') {
                return el[k].map(entity => ({ entity: Object.keys(entity)[0] }));
            }
            return {};
        });
    }
    return [];
};

const formGroupIdsToGroupNames = (forms) => {
    if (!forms || !forms.length > 0) return [];
    const { projectId } = forms[0];
    const storyGroups = StoryGroups.find({
        projectId,
        _id: { $in: forms.map(({ groupId }) => groupId) },
    }).fetch();
    return forms.map(({ groupId, ...form }) => ({
        ...form,
        groupName:
            (storyGroups.find(({ _id }) => _id === groupId) || {}).name || 'unknown',
    }));
};

export const extractDomain = ({
    fragments = [],
    slots = [],
    responses = {},
    defaultDomain = {},
    bfForms = [],
}) => {
    const initialDomain = {
        actions: new Set([...(defaultDomain.actions || []), ...Object.keys(responses)]),
        intents: new Set(defaultDomain.intents || []),
        entities: new Set(defaultDomain.entities || []),
        responses: { ...(defaultDomain.responses || {}), ...responses },
        slots: { ...(defaultDomain.slots || {}), ...getSlotsInRasaFormat(slots) },
        session_config: defaultDomain.session_config || {},
        forms: {
            ...(defaultDomain.forms || {}),
            ...formGroupIdsToGroupNames(bfForms).reduce(
                (acc, { name, ...rest }) => ({ ...acc, [name]: { ...rest, name } }),
                {},
            ),
        },
    };
    const domain = fragments.reduce((acc, frag) => {
        const newEls = scrapeActionsIntentsAndEntities(
            [frag.steps, frag.condition],
            Object.keys(initialDomain.forms),
        );
        newEls.forEach(({ action, intent, entity }) => {
            if (action) acc.actions.add(action);
            if (intent) acc.intents.add(intent);
            if (entity) acc.entities.add(entity);
        });
        return acc;
    }, initialDomain);
    domain.actions = Array.from(domain.actions).sort();
    domain.intents = Array.from(domain.intents).sort();
    domain.entities = Array.from(domain.entities).sort();
    return domain;
};

export const getAllResponses = async (projectId, language = '') => {
    // fetches responses and turns them into nested key-value format
    const responses = await newGetBotResponses({ projectId, language });
    return responses.reduce((acc, curr) => {
        const { key, payload, ...rest } = curr;
        // we do this at the source too, but to be safe here too
        const content = { ...cleanPayload(yaml.safeLoad(payload)), ...rest };
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

const addRequestedSlot = async (slots, projectId) => {
    const newSlots = slots.filter(slot => slot.name !== 'requested_slot');
    const bfForms = await getForms(projectId);
    let requestedSlotCategories = [];

    bfForms.forEach((form) => {
        requestedSlotCategories = requestedSlotCategories.concat(
            form.slots.map(slot => slot.name),
        );
    });

    const requestedSlot = {
        name: 'requested_slot',
        projectId,
        type: 'categorical',
        categories: [...new Set(requestedSlotCategories)],
    };

    newSlots.push(requestedSlot);

    return newSlots;
};

export const getFragmentsAndDomain = async (projectId, language, env = 'development') => {
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

    const selectedGroups = env === 'development' && groups.filter(g => g.selected).length
        ? groups.filter(g => g.selected)
        : groups;

    appMethodLogger.debug('Fetching fragments');
    const allFragments = Stories.find({
        projectId,
        storyGroupId: { $in: selectedGroups.map(({ _id }) => _id) },
        ...(env === 'development' ? {} : { status: 'published' }),
    }).fetch();

    appMethodLogger.debug('Adding checkpoints and smart triggers to stories');
    const fragmentsWithCheckpoints = addCheckpoints(
        allFragments.map(insertSmartPayloads),
    );

    appMethodLogger.debug('Fetching forms');

    let slots = Slots.find({ projectId }).fetch();

    const extraFieldsForPypredConversion = slots.map(slot => slot.name);

    const bfForms = (await getForms(projectId)).map(
        ({
            _id, projectId: pid, pinned, isExpanded, ...rest
        }) => {
            const newElements = { nodes: [], edges: [] };
            if (rest.graph_elements) {
                rest.graph_elements.forEach((elm) => {
                    if (elm.type === 'start') {
                        newElements.nodes.push({
                            id: elm.id,
                            type: elm.type,
                            position: elm.position,
                        });
                    }
                    if (elm.type === 'slot') {
                        newElements.nodes.push({
                            id: elm.id,
                            type: elm.type,
                            slotName: elm.data.slotName,
                            position: elm.position,
                        });
                    }
                    if (elm.type === 'slotSet') {
                        newElements.nodes.push({
                            id: elm.id,
                            type: elm.type,
                            slotName: elm.data.slotName,
                            slotValue: elm.data.slotValue,
                            position: elm.position,
                        });
                    }
                    if (elm.type === 'condition') {
                        newElements.edges.push({
                            id: elm.id,
                            type: elm.type,
                            source: elm.source,
                            target: elm.target,
                            condition:
                                elm.data.condition
                                    ? exportRQABToPypred(elm.data.condition, extraFieldsForPypredConversion)
                                    : null,
                        });
                    }
                });
            }
            return {
                ...rest,
                graph_elements: newElements,
            };
        },
    );

    appMethodLogger.debug('Generating domain');
    const responses = await getAllResponses(projectId, language);
    const project = Projects.findOne({ _id: projectId }, { allowContextualQuestions: 1 });
    if (project.allowContextualQuestions) {
        slots = await addRequestedSlot(slots, projectId);
    }
    const domain = extractDomain({
        fragments: fragmentsWithCheckpoints,
        slots,
        responses,
        defaultDomain,
        bfForms,
    });

    return {
        stories: fragmentsWithCheckpoints
            .filter(({ type }) => !type || type === 'story')
            .map(
                ({
                    storyGroupId,
                    title: story,
                    steps,
                    status = 'published',
                    metadata = {},
                }) => ({
                    story,
                    steps,
                    metadata: {
                        ...metadata,
                        ...(status !== 'published' ? { status } : {}),
                        group: groups.find(g => g._id === storyGroupId)?.name,
                    },
                }),
            ),
        rules: fragmentsWithCheckpoints
            .filter(({ type }) => type === 'rule')
            .map(
                ({
                    storyGroupId,
                    title: rule,
                    condition,
                    steps,
                    conversation_start,
                    wait_for_user_input,
                    status = 'published',
                    metadata = {},
                }) => ({
                    rule,
                    condition,
                    steps,
                    ...(conversation_start ? { conversation_start } : {}),
                    ...(!wait_for_user_input ? { wait_for_user_input } : {}),
                    metadata: {
                        ...metadata,
                        ...(status !== 'published' ? { status } : {}),
                        group: groups.find(g => g._id === storyGroupId)?.name,
                    },
                }),
            ),
        domain,
        wasPartial: groups.length !== selectedGroups.length,
    };
};

export const stringPayloadToObject = function (stringPayload = '') {
    const payloadRegex = /([^{]*) *({.*}|)/;
    const matches = payloadRegex.exec(stringPayload.substring(1));
    const intent = matches[1];
    let entities = matches[2];
    const objectPayload = {
        intent,
        entities: [],
    };
    if (entities && entities !== '') {
        const parsed = JSON.parse(entities);
        entities = Object.keys(parsed).map(key => ({
            entity: key,
            value: parsed[key],
        }));
    } else {
        entities = [];
    }
    objectPayload.entities = entities;
    return objectPayload;
};

export const objectPayloadToString = function ({ intent, entities }) {
    const entitiesMap = entities
        ? entities.reduce((map, obj) => ((map[obj.entity] = obj.value), map), {})
        : {};
    const entitiesString = Object.keys(entitiesMap).length > 0 ? JSON.stringify(entitiesMap) : '';
    return `/${intent}${entitiesString}`;
};
