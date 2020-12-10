import { sortBy, isEqual } from 'lodash';
import { safeDump, safeLoad } from 'js-yaml';
import { Log } from 'meteor/logging';
import axios from 'axios';
import shortid from 'shortid';
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
import { Evaluations } from '../imports/api/nlu_evaluation';
/* globals Migrations */

Migrations.add({
    version: 1,
    up: () => {},
});

Migrations.add({
    version: 2,
    // add default default domain to global settings, and update projects to have this default domain
    up: () => {
        const privateSettings = safeLoad(
            Assets.getText(
                process.env.MODE === 'development'
                    ? 'defaults/private.dev.yaml'
                    : 'defaults/private.yaml',
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

// eslint-disable-next-line import/first
import assert from 'assert';
// eslint-disable-next-line import/first
import BotResponses from '../imports/api/graphql/botResponses/botResponses.model';

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
    version: 3,
    // add default default domain to global settings, and update projects to have this default domain
    up: () => migrateResponses(),
});
Migrations.add({
    version: 4,
    up: () => {
        const allStories = Stories.find().fetch();
        allStories.forEach((story) => {
            const events = [];
            Stories.update({ _id: story._id }, { $set: { events } });
        });
    },
});

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
    version: 5,
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
    version: 6,
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
    version: 7,
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
    version: 8,
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
    version: 9,
    up: () => {
        const allStories = Stories.find().fetch();
        allStories.forEach((story) => {
            const { textIndex, events } = indexStory(story, { includeEventsField: true });
            Stories.update({ _id: story._id }, { $set: { textIndex, events } });
        });
    },
});
Migrations.add({
    version: 10,
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
    version: 11,
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
    version: 12,
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
                { $set: { version: 11, locked: true, lockedAt: new Date() } },
            ); // this is not a downgrade, just an incomplete migration
            Log.error({ message: `Migrations: Locking at version 11 because: ${e.message}.` });
        }
    },
});

Meteor.startup(() => {
    Migrations.migrateTo('latest');
});
