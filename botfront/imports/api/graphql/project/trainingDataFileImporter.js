import _ from 'lodash';
import uuidv4 from 'uuid/v4';
import { StoryGroups } from '../../storyGroups/storyGroups.collection';
import { NLUModels } from '../../nlu_model/nlu_model.collection';
import { deleteExamples, getExamples, insertExamples } from '../examples/mongo/examples';

const wipeAndInsertStoryGroups = async ({
    projectId,
    wipeFragments,
    storyGroupsUsed,
}) => {
    const storyGroupIdMapping = {};
    const existingStoryGroups = StoryGroups.find(
        { projectId },
        { fields: { _id: 1 } },
    ).fetch();
    if (wipeFragments) {
        await Promise.all(
            existingStoryGroups.map(sg => Meteor.callWithPromise('storyGroups.delete', sg)),
        );
    }
    const storyGroupsNeeded = storyGroupsUsed.filter(
        ({ _id: id1 }) => !existingStoryGroups.some(({ _id: id2 }) => id2 === id1),
    );
    await Promise.all(
        storyGroupsNeeded.map((sg) => {
            storyGroupIdMapping[sg.name] = sg._id;
            return Meteor.callWithPromise('storyGroups.insert', { ...sg, projectId });
        }),
    );
    return storyGroupIdMapping;
};

const wipeNluData = async ({ projectId, languages }) => Promise.all(
    languages.flatMap(async (language) => {
        const { examples: currentExamples = [] } = await getExamples({
            pageSize: -1,
            projectId,
            language,
        });
        return [
            deleteExamples({ ids: currentExamples.map(({ _id }) => _id) }),
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
        ];
    }),
);

const addIdIfNotPresent = input => ({ _id: uuidv4(), ...input });

const insertNluData = ({
    nlu: {
        common_examples: commonExamples = [],
        entity_synonyms: synonyms = [],
        fuzzy_gazette: gazette = [],
        regex_features: regex = [],
        language: languageFromFile,
    } = {},
    projectId,
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
                }),
            ));
    }
    if (synonyms.length || gazette.length || regex.length) {
        ops.push(
            new Promise((resolve) => {
                NLUModels.update(
                    { language: languageFromFile, projectId },
                    {
                        $push: {
                            'training_data.entity_synonyms': { $each: synonyms.map(addIdIfNotPresent) },
                            'training_data.fuzzy_gazette': { $each: gazette.map(addIdIfNotPresent) },
                            'training_data.regex_features': { $each: regex.map(addIdIfNotPresent) },
                        },
                    },
                );
                resolve();
            }),
        );
    }
    return ops;
};

const handleImportTrainingData = async (
    files,
    {
        projectId,
        wipeFragments = false,
        wipeNluData: languagesToWipe = [],
        existingStoryGroups: storyGroupsUsed,
    },
) => {
    const storyGroupIdMapping = await wipeAndInsertStoryGroups({
        projectId,
        wipeFragments,
        storyGroupsUsed,
    });
    await wipeNluData({ projectId, languages: languagesToWipe });

    const updates = files.reduce((acc, { nlu = {}, stories = [], rules = [] }) => {
        const fragments = [
            ...stories.map(s => ({ ...s, type: 'story' })),
            ...rules.map(r => ({ ...r, type: 'rule' })),
        ].map(({ metadata: { group, ...metadata }, ...frag }) => ({
            ...frag,
            metadata,
            storyGroupId: storyGroupIdMapping[group],
            projectId,
        }));
        return [
            ...acc,
            ...fragments.map(frag => Meteor.callWithPromise('stories.insert', frag)),
            ...insertNluData({ nlu, projectId }),
        ];
    }, []);
    await Promise.all(updates);
    return [];
};

export default handleImportTrainingData;
