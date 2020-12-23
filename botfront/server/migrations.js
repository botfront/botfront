import { Roles } from 'meteor/alanning:roles';
import { sortBy, isEqual } from 'lodash';
import { safeDump, safeLoad } from 'js-yaml';
import assert from 'assert';
import { Log } from 'meteor/logging';
import axios from 'axios';
import shortid from 'shortid';
import moment from 'moment';
import { Credentials } from '../imports/api/credentials';
import { Endpoints } from '../imports/api/endpoints/endpoints.collection';
import { GlobalSettings } from '../imports/api/globalSettings/globalSettings.collection';
import { Projects } from '../imports/api/project/project.collection';
import { Instances } from '../imports/api/instances/instances.collection';
import { Stories } from '../imports/api/story/stories.collection';
import { NLUModels } from '../imports/api/nlu_model/nlu_model.collection';
import { StoryGroups } from '../imports/api/storyGroups/storyGroups.collection';
import { indexBotResponse } from '../imports/api/graphql/botResponses/mongo/botResponses';
import { insertExamples } from '../imports/api/graphql/examples/mongo/examples';
import { indexStory } from '../imports/api/story/stories.index';
import Activity from '../imports/api/graphql/activity/activity.model';
import AnalyticsDashboards from '../imports/api/graphql/analyticsDashboards/analyticsDashboards.model';
import { defaultDashboard } from '../imports/api/graphql/analyticsDashboards/generateDefaults';
import Forms from '../imports/api/graphql/forms/forms.model';

import BotResponses from '../imports/api/graphql/botResponses/botResponses.model';
import { Evaluations } from '../imports/api/nlu_evaluation';
/* globals Migrations */

Migrations.add({
    version: 1,
    up: () => {
        Meteor.users
            .find()
            .fetch()
            .forEach((u) => {
                const { roles = [] } = u;
                const isAdmin = !!roles.find(r => r._id === 'admin');
                if (isAdmin) {
                    Roles.removeUsersFromRoles(u._id, 'admin');
                    Roles.addUsersToRoles(u._id, 'global-admin');
                }
            });
    },
});

Migrations.add({
    version: 2,
    up: () => {
        Credentials.find({ environment: { $exists: false } })
            .fetch()
            .forEach((i) => {
                Credentials.update(
                    { _id: i._id },
                    { $set: { environment: 'development' } },
                );
            });
        Endpoints.find({ environment: { $exists: false } })
            .fetch()
            .forEach((i) => {
                Endpoints.update(
                    { _id: i._id },
                    { $set: { environment: 'development' } },
                );
            });
    },
});

Migrations.add({
    // Its version 2 on CE
    version: 3,
    // add default default domain to global settings, and update projects to have this default domain
    up: () => {
        const privateSettings = safeLoad(
            Assets.getText(
                process.env.MODE === 'development'
                    ? 'defaults/private.dev.yaml'
                    : process.env.MODE === 'test'
                        ? 'defaults/private.yaml'
                        : 'defaults/private.gke.yaml',
            ),
        );
        const defaultDefaultDomain = safeDump(privateSettings.defaultDomain);

        GlobalSettings.update(
            { _id: 'SETTINGS' },
            { $set: { 'settings.private.defaultDefaultDomain': defaultDefaultDomain } },
        );

        Projects.find()
            .fetch()
            .forEach((i) => {
                Projects.update(
                    { _id: i._id },
                    { $set: { defaultDomain: { content: defaultDefaultDomain } } },
                );
            });
    },
});

const migrateResponses = () => {
    const countUtterMatches = (templateValues) => {
        const re = /utter_/g;
        return ((JSON.stringify(templateValues) || '').match(re) || []).length;
    };
    try {
        Projects.find()
            .fetch()
            .forEach((p) => {
                if (p.templates) {
                    const templates = sortBy(p.templates, 'key');
                    const newTemplates = [];
                    const duplicates = [];
                    templates.forEach((t, index) => {
                        // Delete irrelevant fields and set new _id
                        delete t.match;
                        delete t.followUp;
                        t.projectId = p._id;
                        // Put duplicates in a separate list
                        if (
                            (index < templates.length - 1
                                && t.key === templates[index + 1].key)
                            || (index > 0 && t.key === templates[index - 1].key)
                        ) {
                            duplicates.push(t);
                        } else {
                            newTemplates.push(t);
                        }
                    });
                    let i = 0;
                    while (i < duplicates.length) {
                        let numberOfOccurence = 1;
                        while (
                            i + numberOfOccurence < duplicates.length
                            && duplicates[i].key === duplicates[i + numberOfOccurence].key
                        ) {
                            numberOfOccurence += 1;
                        }
                        const duplicateValues = duplicates.slice(
                            i,
                            i + numberOfOccurence,
                        );
                        assert(
                            Array.from(new Set(duplicateValues.map(t => t.key)))
                                .length === 1,
                        ); // Make sure duplicates are real
                        // Count times /utter_/ is a match
                        const utters = duplicateValues.map(t => countUtterMatches(t.values));
                        // Find the index of the template with less /utter_/ in it. This is the value we'll keep
                        const index = utters.indexOf(Math.min(...utters));
                        // Push the template we keep in the array of valid bot responses
                        newTemplates.push(duplicateValues[index]);
                        i += numberOfOccurence;
                    }

                    // Integrity check
                    const distinctInDuplicates = [
                        ...new Set(duplicates.map(d => d.key)),
                    ].length;
                    // duplicates.length - distinctInDuplicates: give back the number of occurence of a value minus one
                    assert(
                        newTemplates.length
                            === templates.length - (duplicates.length - distinctInDuplicates),
                    );
                    assert(
                        Array.from(new Set(newTemplates)).length === newTemplates.length,
                    );
                    // Insert bot responses in new collection
                    newTemplates.forEach((response) => {
                        BotResponses.updateOne(
                            { key: response.key, projectId: response.projectId },
                            response,
                            { upsert: true, setDefaultsOnInsert: true },
                        ).exec();
                    });
                    // Remote bot responses from project
                    Projects.update({ _id: p._id }, { $unset: { templates: '' } });
                }
            });
    } catch (err) {
        console.log(`The bot responses migration encountered an error: ${err}`);
    }
};

// migrateResponses();
Migrations.add({
    version: 4,
    // add default default domain to global settings, and update projects to have this default domain
    up: () => migrateResponses(),
});
Migrations.add({
    version: 5,
    up: () => {
        const allStories = Stories.find().fetch();
        allStories.forEach((story) => {
            const events = [];
            Stories.update({ _id: story._id }, { $set: { events } });
        });
    },
});

// instances: type: nlu -> server
const processSequence = sequence => sequence
    .map(s => safeLoad(s.content))
    .reduce((acc, curr) => {
        const newSequent = {};
        if (curr.text && !acc.text) newSequent.text = curr.text;
        if (curr.text && acc.text) newSequent.text = `${acc.text}\n\n${curr.text}`;
        if (curr.buttons) {
            newSequent.buttons = [...(acc.buttons || []), ...curr.buttons];
        }
        return newSequent;
    }, {});

Migrations.add({
    version: 6,
    // join sequences of text in responsesa
    up: () => {
        BotResponses.find()
            .lean()
            .then(responses => responses.forEach((response) => {
                const updatedResponse = {
                    ...response,
                    values: response.values.map(value => ({
                        ...value,
                        sequence: [
                            { content: safeDump(processSequence(value.sequence)) },
                        ], //
                    })),
                };
                delete updatedResponse._id;
                if (!isEqual(response, updatedResponse)) {
                    const { projectId, key } = response;
                    BotResponses.updateOne(
                        { projectId, key },
                        updatedResponse,
                    ).exec();
                }
            }));
    },
});
Migrations.add({
    version: 7,
    // Remove object ids from activities
    up: async () => {
        Activity.find()
            .lean()
            .then(activities => activities.forEach(async (activity) => {
                if (typeof activity._id !== 'string') {
                    try {
                        const { _id, ...activityWithoutId } = activity;
                        await Activity.deleteOne(activityWithoutId);
                        const idString = activity._id.toString();

                        await Activity.create({
                            _id: idString,
                            ...activityWithoutId,
                        });
                    } catch (e) {
                        console.log(
                            'something went wrong during a migration, contact Botfront for further help',
                        );
                    }
                }
            }));
    },
});
Migrations.add({
    version: 8,
    // add webhooks in private global settings: EE-SPECIFIC
    up: () => {
        const { webhooks } = safeLoad(
            Assets.getText(
                process.env.MODE === 'development'
                    ? 'defaults/private.dev.yaml'
                    : process.env.MODE === 'test'
                        ? 'defaults/private.yaml'
                        : 'defaults/private.gke.yaml',
            ),
        );
        GlobalSettings.update(
            { _id: 'SETTINGS' },
            { $set: { 'settings.private.webhooks': webhooks } },
        );
    },
});

Migrations.add({
    version: 9,
    // Migrates to roles v3
    up: () => {
        // eslint-disable-next-line no-underscore-dangle
        Roles._forwardMigrate2();
    },
    down: () => {
        // eslint-disable-next-line no-underscore-dangle
        Roles._backwardMigrate2();
    },
});

Migrations.add({
    version: 10,
    up: () => {
        Roles.deleteRole('conversations-editor');
        Roles.deleteRole('conversations-viewer');
        Roles.deleteRole('conversations:r');
        Roles.deleteRole('conversations:w');
        Roles.deleteRole('copy-editor');
        Roles.deleteRole('copy-viewer');
        Roles.deleteRole('nlu-model:r');
        Roles.deleteRole('nlu-model:w');
        Roles.deleteRole('nlu-model:x');
        Roles.deleteRole('nlu-viewer');
        Roles.deleteRole('owner');
        Roles.deleteRole('project-settings:r');
        Roles.deleteRole('project-settings:w');
        Roles.deleteRole('project-viewer');
    },
    down: () => {},
});

Migrations.add({
    version: 11, // CE version 7
    // Touch up on story and storygroup schema
    up: async () => {
        const stories = Stories.find().fetch();
        const children = {};
        const projectIds = new Set();

        stories.forEach((s) => {
            // add to list of children
            children[s.storyGroupId] = [...(children[s.storyGroupId] || []), s._id];
            projectIds.add(s.projectId);
        });
        Array.from(projectIds).forEach((projectId) => {
            StoryGroups.insert({
                name: 'Stories with triggers',
                projectId,
                smartGroup: {
                    prefix: 'withTriggers',
                    query: '{ "rules.0.payload": { "$exists": true } }',
                },
                isExpanded: true,
            });
        });

        const storyGroups = StoryGroups.find().fetch();
        storyGroups.sort((a, b) => b.introStory - a.introStory);

        storyGroups.forEach(sg => StoryGroups.update(
            { _id: sg._id },
            {
                $set: {
                    isExpanded: !!sg.introStory,
                    children: children[sg._id],
                },
            },
        ));

        // add storygroup key under projects
        Array.from(projectIds).forEach((projectId) => {
            const storyGroupsForProject = storyGroups
                .filter(sg => sg.projectId === projectId)
                .map(sg => sg._id);
            Projects.update(
                { _id: projectId },
                { $set: { storyGroups: storyGroupsForProject } },
            );
        });
    },
});

Migrations.add({
    version: 12,
    up: () => {
        BotResponses.find()
            .lean()
            .then((botResponses) => {
                botResponses.forEach((botResponse) => {
                    const textIndex = indexBotResponse(botResponse);
                    BotResponses.updateOne(
                        { _id: botResponse._id },
                        { textIndex },
                    ).exec();
                });
            });
        const allStories = Stories.find().fetch();
        allStories.forEach((story) => {
            const { textIndex } = indexStory(story);
            Stories.update({ _id: story._id }, { $set: { textIndex } });
        });
    },
});

Migrations.add({
    // EE-SPECIFIC!
    version: 13,
    up: () => {
        Roles.deleteRole('nlu-editor');
    },
    down: () => {},
});

Migrations.add({
    // EE-SPECIFIC!
    version: 14,
    up: () => {
        Projects.find()
            .fetch()
            .forEach(project => AnalyticsDashboards.create(defaultDashboard(project)));
    },
});

Migrations.add({
    version: 15,
    up: () => {
        const allStories = Stories.find().fetch();
        allStories.forEach((story) => {
            const { textIndex, events } = indexStory(story, { includeEventsField: true });
            Stories.update({ _id: story._id }, { $set: { textIndex, events } });
        });
    },
});

Migrations.add({
    version: 16,
    up: () => {
        StoryGroups.update(
            // add pinned status to smart groups
            { smartGroup: { $exists: true } },
            { $set: { pinned: true } },
            { multi: true },
        );
        Projects.find()
            .fetch() // put them at the top
            .forEach(({ _id: projectId, storyGroups }) => {
                const pinned = StoryGroups.find({ projectId, pinned: true }, { _id: 1 })
                    .fetch()
                    .map(({ _id }) => _id);
                const storyGroupsSorted = storyGroups.sort(
                    (a, b) => pinned.includes(b) - pinned.includes(a),
                );
                Projects.update(
                    { _id: projectId },
                    { $set: { storyGroups: storyGroupsSorted } },
                );
            });
    },
});

Migrations.add({
    version: 17,
    up: async () => {
        const { webhooks } = safeLoad(
            Assets.getText(
                process.env.MODE === 'development'
                    ? 'defaults/private.dev.yaml'
                    : process.env.MODE === 'test'
                        ? 'defaults/private.yaml'
                        : 'defaults/private.gke.yaml',
            ),
        );
        GlobalSettings.update(
            { _id: 'SETTINGS' },
            {
                $set: {
                    'settings.private.webhooks.deploymentWebhook':
                        webhooks.deploymentWebhook,
                },
            },
        );

        const stories = Stories.find().fetch();
        const projectIds = new Set();

        stories.forEach((s) => {
            projectIds.add(s.projectId);
        });
        Array.from(projectIds).forEach((projectId) => {
            StoryGroups.insert({
                name: 'Unpublished stories',
                projectId,
                smartGroup: { prefix: 'unpublish', query: '{ "status": "unpublished" }' },
                isExpanded: false,
                pinned: true,
            });
        });
        Stories.update({}, { $set: { status: 'published' } }, { multi: true });
    },
});

Migrations.add({
    version: 18,
    up: async () => {
        const checkIsTypeButtons = (content) => {
            // the only type defining key in the response content should be buttons
            const included = [
                'image',
                'buttons',
                'elements',
                'custom',
                'attachment',
                'quick_replies',
            ].filter(k => Object.keys(content).includes(k));
            return included.length === 1 && included[0] === 'buttons';
        };

        const updateContent = (sequence) => {
            const content = safeLoad(sequence.content);
            // check if it is a buttons response
            if (!checkIsTypeButtons(content)) throw new Error('not a buttons response');
            // replace buttons with quick replies
            content.quick_replies = content.buttons;
            delete content.buttons;
            return { ...sequence, content: safeDump(content) };
        };

        // start migration
        const responses = await BotResponses.find().lean();
        if (!responses || !responses.length) return;

        const updatedResponses = responses.reduce((buttonResponses, response) => {
            try {
                const values = response.values.map(value => ({
                    ...value,
                    sequence: value.sequence.map(updateContent),
                }));
                return [...buttonResponses, { ...response, values }];
            } catch (err) {
                // we do not need to update the response if it is not a buttons response
                return buttonResponses;
            }
        }, []);

        updatedResponses.forEach((response) => {
            BotResponses.update(updatedResponses);
            const { projectId, key } = response;
            const { _id, ...rest } = response;
            BotResponses.updateOne({ projectId, key }, rest).exec();
        });
    },
});

Migrations.add({
    version: 19,
    up: async () => {
        const { webhooks } = safeLoad(
            Assets.getText(
                process.env.MODE === 'development'
                    ? 'defaults/private.dev.yaml'
                    : process.env.MODE === 'test'
                        ? 'defaults/private.yaml'
                        : 'defaults/private.gke.yaml',
            ),
        );
        GlobalSettings.update(
            { _id: 'SETTINGS' },
            {
                $set: {
                    'settings.private.webhooks.reportCrashWebhook':
                        webhooks.reportCrashWebhook,
                },
            },
        );
    },
});

Migrations.add({
    version: 20,
    up: async () => {
        // update stories to have a trigger intent
        const stories = await Stories.find().fetch();
        if (!stories) return;
        stories.forEach(({ _id, rules }) => {
            const update = {
                triggerIntent: `trigger_${shortid.generate()}`,
            };
            if (rules && rules[0] && rules[0].payload) {
                update.triggerIntent = rules[0].payload.replace(/^\//, '');
                rules.map(rule => ({ ...rule, payload: update.triggerIntent }));
            }
            Stories.update({ _id }, { $set: update });
        });
        // update the analytics dashboard
        const dashboards = await AnalyticsDashboards.find();
        dashboards.forEach(async (dashboard) => {
            const { cards } = dashboard;
            if (!cards.some(({ type }) => type === 'triggerFrequencies')) {
                cards.push({
                    name: 'Top 10 Triggers',
                    type: 'triggerFrequencies',
                    visible: true,
                    startDate: moment().subtract(6, 'days').startOf('day').toISOString(),
                    endDate: moment().endOf('day').toISOString(),
                    chartType: 'bar',
                    valueType: 'absolute',
                    limit: '10',
                });
            }
            const newCards = cards.map((card) => {
                if (card.type === 'conversationCounts') {
                    const newCard = card;
                    delete newCard.includeIntents;
                    delete newCard.excludeIntents;
                    delete newCard.includeActions;
                    delete newCard.excludeActions;
                    return {
                        ...newCard,
                        conversationLength: 1,
                        userInitiatedConversations: true,
                        triggerConversations: true,
                    };
                }
                if (card.type === 'intentFrequencies') {
                    return { ...card, limit: '10' };
                }
                return card;
            });
            await AnalyticsDashboards.updateOne(
                { _id: dashboard._id },
                { $set: { cards: newCards } },
                { useFindAndModify: false },
            );
        });
    },
});

Migrations.add({
    version: 21,
    up: async () => {
        const dashboards = await AnalyticsDashboards.find();
        dashboards.forEach(async (dashboard) => {
            const { cards } = dashboard;
            const newCards = cards.map((card) => {
                const newCard = card;
                if (
                    card.type === 'conversationCounts'
                    && Array.isArray(card.intentsAndActionsFilters)
                ) {
                    newCard.eventFilterOperator = card.intentsAndActionsOperator;
                    newCard.eventFilter = card.intentsAndActionsFilters.map((event) => {
                        if (
                            event.name.startsWith('utter_')
                            || event.name.startsWith('action_')
                        ) {
                            return { ...event, type: 'action' };
                        }
                        return { ...event, type: 'intent' };
                    });
                    delete newCard.intentsAndActionsOperator;
                    delete newCard.intentsAndActionsFilters;
                }
                if (card.type === 'conversationsFunnel') {
                    newCard.selectedSequence = (card.selectedSequence || []).map(
                        (event) => {
                            if (
                                event.name.startsWith('utter_')
                                || event.name.startsWith('action_')
                            ) {
                                return { ...event, type: 'action' };
                            }
                            return { ...event, type: 'intent' };
                        },
                    );
                }
                return newCard;
            });
            await AnalyticsDashboards.updateOne(
                { _id: dashboard._id },
                { $set: { cards: newCards } },
                { useFindAndModify: false },
            );
        });
    },
});

Migrations.add({
    version: 22,
    up: async () => {
        const forms = await Forms.find().lean();
        const groups = {};

        const formIds = forms.map(({ _id }) => _id);
        await Projects.update(
            {},
            { $pull: { storyGroups: { $in: formIds } } },
            { multi: true },
        );

        forms.forEach(async (form) => {
            let { groupId } = form;
            if (!groupId) {
                if (!groups[form.projectId]) {
                    groups[form.projectId] = {
                        _id: shortid.generate(),
                        projectId: form.projectId,
                        children: [],
                        isExpanded: true,
                        pinned: false,
                        selected: false,
                    };
                }
                groupId = groups[form.projectId]._id;
                groups[form.projectId].children.push(form._id);
                await Forms.updateOne(
                    { _id: form._id },
                    {
                        $set: {
                            groupId,
                        },
                    },
                );
            }

            if (!form.slots || !(form.slots.length > 0)) return;
            // if the form has graph_elements it was migrated previously
            if (form.graph_elements) return;
            // eslint-disable-next-line camelcase
            const graph_elements = form.slots.reduce(
                (acc, slot, i) => {
                    const previousId = i === 0 ? '1' : form.slots[i - 1].name;
                    const { name, filling, ...slotData } = slot;
                    return [
                        ...acc,
                        {
                            id: slot.name,
                            data: {
                                ...slotData,
                                slotName: name,
                                type: 'slot',
                                filling:
                                    filling.length > 0
                                        ? filling
                                        : [{ type: 'from_entity' }],
                            },
                            position: { x: 120, y: 200 + (i + 1) * 150 },
                            type: 'slot',
                            className: 'slot-node',
                        },
                        {
                            id: `e${previousId}-${slot.name}`,
                            source: previousId,
                            target: `${slot.name}`,
                            animated: true,
                            type: 'condition',
                            arrowHeadType: 'arrowclosed',
                            data: {
                                condition: null,
                            },
                        },
                    ];
                },
                [
                    {
                        id: '1',
                        data: { type: 'start' },
                        position: { x: 200, y: 200 },
                        type: 'start',
                        className: 'start-node',
                    },
                ],
            );
            await Forms.updateOne(
                { _id: form._id },
                {
                    $set: {
                        graph_elements,
                    },
                },
            );
        });

        Object.values(groups).forEach(async (group) => {
            const pinnedGroups = StoryGroups.find({
                projectId: group.projectId,
                pinned: true,
            }).fetch();
            const nameConflicts = StoryGroups.find(
                { projectId: group.projectId, name: { $regex: 'forms' } },
                { fields: { name: 1 } },
            ).fetch();
            const groupNames = nameConflicts ? nameConflicts.map(({ name }) => name) : [];
            let safeName = 'forms';
            const index = 1;
            while (groupNames.includes(safeName)) {
                safeName = `forms ${index}`;
            }
            await StoryGroups.insert({ ...group, name: safeName });
            await Projects.update(
                { _id: group.projectId },
                {
                    $push: {
                        storyGroups: {
                            $each: [group._id],
                            $position: pinnedGroups.length,
                        },
                    },
                },
            );
        });
    },
});

Migrations.add({
    version: 23, // CE 11
    up: async () => {
        const projects = await Projects.find({}, { fields: { nlu_models: 1, _id: 1 } });
        projects.forEach((project) => {
            const projectId = project._id;
            const NluModels = NLUModels.find({ _id: { $in: project.nlu_models } });
            const languages = {};
            NluModels.forEach(async (nluModel) => {
                const {
                    language,
                    training_data: { common_examples: examples = [] },
                } = nluModel;
                languages[language] = nluModel._id;
                const preparedExamples = examples.map((example) => {
                    const isCanonical = example.canonical;
                    // eslint-disable-next-line no-param-reassign
                    delete example.canonical;
                    return {
                        ...example,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        projectId: project._id,
                        metadata: { canonical: isCanonical, language },
                        _id: shortid.generate(),
                    };
                });
                await insertExamples({
                    examples: preparedExamples,
                    language,
                    projectId,
                });
            });
            // add 'languages' key to projects
            Projects.update(
                { _id: projectId },
                { $set: { languages: Object.keys(languages) } },
            );
            // add 'projectId' and 'language' keys to activity and evaluation docs
            Object.keys(languages).forEach(async (language) => {
                await Activity.updateMany(
                    { modelId: languages[language] },
                    { $set: { language, projectId } },
                ).exec();
                Evaluations.update(
                    { modelId: languages[language] },
                    { $set: { language, projectId } },
                );
            });
            // pull common examples and add 'projectId' key to models
            NLUModels.update(
                { _id: { $in: project.nlu_models } },
                { $unset: { 'training_data.common_examples': '' }, $set: { projectId } },
                { multi: true },
            );
        });
        await Activity.syncIndexes(); // remove old modelId_text_env index
    },
});

const flattenStoriesForConversion = (stories, priorPath = '') => stories.reduce((acc, { _id, story, branches }, i) => {
    const title = priorPath ? `${priorPath}__${i}` : _id;
    return [
        ...acc,
        `\n## ${title}\n${story || ''}`,
        ...flattenStoriesForConversion(branches || [], title),
    ];
}, []);

const generateStoryUpdates = (stories) => {
    const storyUpdates = {};
    stories.forEach(({ story: title, steps }) => {
        const [_id, ...indices] = title.split('__');
        const { $set, $unset } = storyUpdates[_id] || { $set: {}, $unset: {} };
        const pathPrefix = indices.length
            ? `branches.${indices.join('.branches.')}.`
            : '';
        storyUpdates[_id] = {
            $set: {
                ...$set,
                type: 'story',
                [`${pathPrefix}steps`]: steps,
            },
            $unset: {
                ...$unset,
                [`${pathPrefix}story`]: '',
            },
        };
    });
    return storyUpdates;
};

Migrations.add({
    version: 24, // CE 12
    up: async () => {
        // check whether BF was never init or migration has already completed
        // (story key is deleted at last step, which differentiates new and legacy stories)
        if (!Stories.find({ story: { $exists: true } }).count()) return;
        const instances = Instances.find({
            projectId: { $not: { $regex: 'chitchat' } },
        }).fetch();
        const host = instances.length === 1
            ? instances[0].host
            : process.env.RASA_MIGRATION_INSTANCE_URL;
        if (!host) {
            throw new Error(
                'Could not find Rasa instance to convert stories to Rasa 2.0 format. Please set env var RASA_MIGRATION_INSTANCE_URL.',
            );
        }
        try {
            const stories = Stories.find(
                { story: { $exists: true } },
                { story: 1, _id: 1, branches: 1 },
            ).fetch();
            const storiesFlattened = flattenStoriesForConversion(stories).join('\n');
            const axiosClient = axios.create();
            const { data: { data = '' } = {} } = await axiosClient.post(
                `${host}/data/convert/core`,
                {
                    data: storiesFlattened,
                    input_format: 'md',
                    output_format: 'yaml',
                },
            );
            const { stories: parsedStories } = safeLoad(data);

            // this filters out stories that rasa could not converts, this happens because the story had only lines that made no sense
            // we can safely delete these.
            const nonsensicalStories = stories.filter(story => !parsedStories.some(pStory => pStory.story === story._id));
            await Stories.remove({ _id: { $in: nonsensicalStories.map(story => story._id) } });

            const storyUpdates = generateStoryUpdates(parsedStories);

            Object.keys(storyUpdates).forEach(_id => Stories.update({ _id }, storyUpdates[_id]));
            // rebuild indices
            const allStories = Stories.find().fetch();
            allStories.forEach((story) => {
                const { textIndex, events } = indexStory(story);
                Stories.update({ _id: story._id }, { $set: { type: story.type || 'story', textIndex, events } });
            });
        } catch (e) {
            // eslint-disable-next-line no-underscore-dangle
            Migrations._collection._collection.update(
                { _id: 'control' },
                { $set: { version: 22, locked: true, lockedAt: new Date() } },
            ); // this is not a downgrade, just an incomplete migration
            Log.error({
                message: `Migrations: Locking at version 22 because: ${e.message}.`,
            });
        }
        StoryGroups.update( // payload key is no longer in use, update 'storyGroups w/ triggers'
            { 'smartGroup.query': '{ "rules.0.payload": { "$exists": true } }' },
            { $set: { 'smartGroup.query': '{ "rules.0": { "$exists": true } }' } },
        );
    },
});

Meteor.startup(() => {
    Migrations.migrateTo('latest');
});
