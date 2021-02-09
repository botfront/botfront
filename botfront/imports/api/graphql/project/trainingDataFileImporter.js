import _ from 'lodash';
import uuidv4 from 'uuid/v4';
import { StoryGroups } from '../../storyGroups/storyGroups.collection';
import { NLUModels } from '../../nlu_model/nlu_model.collection';
import { deleteExamples, getExamples, insertExamples } from '../examples/mongo/examples';
// this is done so it's not loaded by the clientside
// when it loads examplesResolver referencees audit log that only available on the server and causeing a error saying
// Cannot find module '../../../../../server/logger'
let publishIntentsOrEntitiesChanged = () => {};
if (Meteor.isServer) {
    import { publishIntentsOrEntitiesChanged as pub } from '../examples/resolvers/examplesResolver';

    publishIntentsOrEntitiesChanged = pub;
}
const keepOrReturnEmptyObject = object => object; // on CE, () => ({}), on EE id function

const wipeAndInsertStoryGroups = async ({
    projectId,
    wipeFragments,
    storyGroupsUsed,
}) => {
    const storyGroupIdMapping = {};
    const errors = [];
    const existingStoryGroups = await StoryGroups.find(
        { projectId, smartGroup: { $exists: false } },
        { fields: { _id: 1, name: 1 } },
    ).fetch();
    let storyGroupsNeeded = storyGroupsUsed.filter(
        ({ _id: id1 }) => !existingStoryGroups.some(({ _id: id2 }) => id2 === id1),
    );
    if (wipeFragments) {
        await existingStoryGroups
            .reduce(
                (previous, sg) => previous.finally(() => Meteor.callWithPromise('storyGroups.delete', sg)),
                Promise.resolve(),
            )
            .catch(e => errors.push(`Error deleting fragment groups: ${e.message || e.reason}`));
        storyGroupsNeeded = storyGroupsUsed;
    }
    await storyGroupsNeeded
        .reduce(
            (previous, sg) => previous.finally(() => {
                storyGroupIdMapping[sg.name] = sg._id;
                return Meteor.callWithPromise('storyGroups.insert', {
                    ...sg,
                    projectId,
                });
            }),
            Promise.resolve(),
        )
        .catch(e => errors.push(`Error creating fragment groups: ${e.message || e.reason}`));
    return [errors, storyGroupIdMapping];
};

const wipeNluData = async ({ projectId, languages }) => {
    const errors = [];
    await Promise.all(
        languages.flatMap(async (language) => {
            const { examples: currentExamples = [] } = await getExamples({
                pageSize: -1,
                projectId,
                language,
            });
            return Promise.all([
                deleteExamples({ ids: currentExamples.map(({ _id }) => _id), projectId }),
                new Promise((resolve) => {
                    NLUModels.update(
                        { language, projectId },
                        {
                            $set: {
                                'training_data.entity_synonyms': [],
                                'training_data.fuzzy_gazette': [],
                                'training_data.regex_features': [],
                            },
                        },
                    );
                    resolve();
                }),
            ]).catch(e => errors.push(
                `Error wiping NLU for '${language}': ${e.message || e.reason}`,
            ));
        }),
    );
    return errors;
};

const addIdIfNotPresent = input => ({ _id: uuidv4(), ...input });

const insertNluData = ({
    nlu: {
        common_examples: commonExamples = [],
        entity_synonyms: synonyms = [],
        gazette = [],
        regex_features: regex = [],
        language: languageFromFile,
    } = {},
    projectId,
    filename,
}) => {
    const ops = [];
    if (commonExamples.length) {
        _.chain(commonExamples)
            .groupBy(({ metadata: { language } } = {}) => language)
            .map((examples, language) => ({ language, examples }))
            .value()
            .forEach(({ language, examples }) => ops.push(
                insertExamples({
                    language,
                    projectId,
                    examples,
                    options: { overwriteOnSameText: true },
                })
                    .then(() => null)
                    .catch(
                        e => `Error inserting NLU examples from '${filename}' for language '${language}': ${
                            e.message || e.reason
                        }.`,
                    ),
            ));
        if (Meteor.isServer) {
            publishIntentsOrEntitiesChanged(projectId, languageFromFile);
        }
    }
    if (synonyms.length || gazette.length || regex.length) {
        ops.push(
            new Promise((resolve) => {
                NLUModels.update(
                    { language: languageFromFile, projectId },
                    {
                        $push: {
                            'training_data.entity_synonyms': {
                                $each: synonyms.map(addIdIfNotPresent),
                            },
                            'training_data.fuzzy_gazette': {
                                $each: gazette.map(addIdIfNotPresent),
                            },
                            'training_data.regex_features': {
                                $each: regex.map(addIdIfNotPresent),
                            },
                        },
                    },
                );
                resolve();
            })
                .then(() => null)
                .catch(
                    e => `Error inserting synonyms, gazette or regex from '${filename}' for language '${languageFromFile}': ${
                        e.message || e.reason
                    }`,
                ),
        );
    }
    return ops;
};

const removeTriggerIntents = ({
    metadata: { triggerIntent, rules, ...metadata },
    ...frag
}) => {
    const steps = frag.steps || [];
    if (triggerIntent) {
        if (steps[0]?.intent === triggerIntent) {
            steps.shift();
        } else if (steps[0]?.or) {
            steps[0].or = steps[0].or.filter(({ intent }) => intent !== triggerIntent);
        }
    }
    return {
        ...frag,
        steps,
        metadata,
        ...keepOrReturnEmptyObject({
            ...(triggerIntent ? { triggerIntent } : {}),
            ...(rules ? { rules } : {}),
        }),
    };
};

const handleImportTrainingData = async (
    files,
    {
        projectId,
        wipeFragments = false,
        wipeNluData: languagesToWipe = [],
        storyGroupsUsed,
    },
) => {
    const [errorsFromGroups, storyGroupIdMapping] = await wipeAndInsertStoryGroups({
        projectId,
        wipeFragments,
        storyGroupsUsed,
    });
    if (errorsFromGroups.length) return errorsFromGroups;
    const errorsFromNlu = await wipeNluData({ projectId, languages: languagesToWipe });
    if (errorsFromNlu.length) return errorsFromNlu;
    const updates = files.reduce(
        (acc, {
            nlu = {}, stories = [], rules = [], tests = [], filename,
        }) => {
            const fragments = [
                ...stories.map(s => ({ ...s, type: 'story' })),
                ...rules.map(r => ({ ...r, type: 'rule' })),
                ...tests.map(t => ({ ...t, type: 'test_case' })),
            ].map(({ metadata: { group, status = 'published', ...metadata }, ...frag }) => removeTriggerIntents({
                ...frag,
                ...keepOrReturnEmptyObject({ status }),
                metadata,
                storyGroupId: storyGroupIdMapping[group],
                projectId,
            }));
            const fragmentOp = fragments.length
                ? [
                    Meteor.callWithPromise('stories.insert', fragments)
                        .then(() => null)
                        .catch(
                            e => `Error inserting dialogue fragments from '${filename}': ${
                                e.message || e.reason
                            }`,
                        ),
                ]
                : [];
            return [
                ...acc,
                ...fragmentOp,
                ...insertNluData({ nlu, projectId, filename }),
            ];
        },
        [],
    );
    return Promise.all(updates);
};

export default handleImportTrainingData;
