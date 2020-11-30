if (Meteor.isServer) {
    import '../../../../server/main';
    import fs from 'fs';
    import chai, { expect } from 'chai';
    import deepEqualInAnyOrder from 'deep-equal-in-any-order';
    import { basename } from 'path';
    import { caught } from '../../../lib/client.safe.utils';
    import { importSteps } from './import.utils';
    import { GlobalSettings } from '../../globalSettings/globalSettings.collection';
    import { Stories } from '../../story/stories.collection';
    import { StoryGroups } from '../../storyGroups/storyGroups.collection';
    import Examples from '../examples/examples.model.js';
    import { insertExamples } from '../examples/mongo/examples.js';

    chai.use(deepEqualInAnyOrder);

    const fixturePathToFile = (filePath) => {
        const absolutePath = Assets.absoluteFilePath(`fixtures/${filePath}`);
        return {
            createReadStream: () => fs.createReadStream(absolutePath),
            filename: basename(absolutePath),
        };
    };

    const importStepsWrapped = (filePaths, options = {}) => importSteps({
        projectId: 'bf',
        ...options,
        files: filePaths.map(fixturePathToFile),
    });

    describe('import route', () => {
        before(
            caught(async () => {
                try {
                    GlobalSettings.remove({ _id: 'SETTINGS' });
                } finally {
                    await Meteor.callWithPromise(
                        'initialSetup.firstStep',
                        { email: 'a@a.com', password: 'aa' },
                        false,
                    );
                }
            }),
        );
        beforeEach(
            caught(async () => {
                await Meteor.callWithPromise('project.delete', 'bf', {
                    failSilently: true,
                });
                await Meteor.callWithPromise('initialSetup.secondStep', {
                    _id: 'bf',
                    project: 'bf',
                    language: 'en',
                });
            }),
        );
        after(caught(() => Meteor.callWithPromise('project.delete', 'bf', {
            failSilently: true,
        })));


        describe('training data import', () => {
            const getStoryGroupNameMapping = (projectId = 'bf') => StoryGroups.find({ projectId }, { name: 1, _id: 1 })
                .fetch()
                .reduce((acc, curr) => ({ ...acc, [curr.name]: curr._id }), {});
    
            const getStoriesAndExamples = async () => {
                const examples = (
                    await Examples.find().lean()
                ).map(({ intent, metadata: { language } = {} }) => [intent, language]);
                const stories = Stories.find({}, { title: 1, storyGroupId: 1 })
                    .fetch()
                    .map(({ storyGroupId, title }) => ({ storyGroupId, title }));
                return [stories, examples];
            };

            beforeEach(caught(async () => {
                await insertExamples({
                    examples: [
                        { text: 'hey', intent: 'greet' },
                        { text: 'Dobro jutro', intent: 'greet' },
                    ],
                    language: 'en',
                    projectId: 'bf',
                });
                await insertExamples({
                    examples: [{ text: 'Ha\'anen Maolek', intent: 'greet' }],
                    language: 'ch',
                    projectId: 'bf',
                });
            }));
            const parametrizeTest = async ({ nlu, fragments, ...options } = {}, results = {}) => {
                const [segmentsBefore] = await getStoriesAndExamples();
                const { summary: errors } = await importStepsWrapped([
                    ...(fragments ? ['training_data/stories01.yml', 'training_data/stories02.yml'] : []),
                    ...(nlu ? ['training_data/nlu02.json'] : []),
                ], { ...options });
                const [segmentsAfter, examplesAfter] = await getStoriesAndExamples();
                const sgIds = getStoryGroupNameMapping();
                expect(errors).to.have.lengthOf(0);
                expect(Object.keys(sgIds)).to.have.lengthOf(results.groupLength);
                expect(segmentsAfter).to.deep.equalInAnyOrder([
                    ...(results.oldSegments ? segmentsBefore : []),
                    ...(results.newSegments ? [
                        { title: 'Greetings', storyGroupId: sgIds['stories01.yml'] },
                        { title: 'Farewells', storyGroupId: sgIds['stories02.yml'] },
                        { title: 'Get started', storyGroupId: sgIds['stories02.yml'] },
                    ] : []),
                ]);
                expect(examplesAfter).to.have.lengthOf(results.exampleLength);
                expect(
                    examplesAfter.filter(([i, l]) => i === 'greet' && l === 'en'),
                ).to.have.lengthOf(results.exampleComboLength[0]);
                expect(
                    examplesAfter.filter(([i, l]) => i === 'greet' && l === 'fr'),
                ).to.have.lengthOf(results.exampleComboLength[1]);
                expect(
                    examplesAfter.filter(([i, l]) => i === 'greet' && l === 'ch'),
                ).to.have.lengthOf(results.exampleComboLength[2]);
                expect(
                    examplesAfter.filter(
                        ([i, l]) => i === 'estimate_emissions' && l === 'en',
                    ),
                ).to.have.lengthOf(results.exampleComboLength[3]);
            };
            describe('import nlu and fragments', () => {
                it(
                    '!wipeInvolvedCollections, !wipeProject',
                    caught(() => parametrizeTest({ nlu: true, fragments: true }, {
                        groupLength: 3,
                        oldSegments: true,
                        newSegments: true,
                        exampleLength: 9,
                        exampleComboLength: [4, 2, 1, 2],
                    })),
                );
                it(
                    'wipeInvolvedCollections',
                    caught(() => parametrizeTest({ nlu: true, fragments: true, wipeInvolvedCollections: true }, {
                        groupLength: 2,
                        oldSegments: false,
                        newSegments: true,
                        exampleLength: 8,
                        exampleComboLength: [3, 2, 1, 2],
                    })),
                );
                it(
                    'wipeProject',
                    caught(() => parametrizeTest({ nlu: true, fragments: true, wipeProject: true }, {
                        groupLength: 2,
                        oldSegments: false,
                        newSegments: true,
                        exampleLength: 7,
                        exampleComboLength: [3, 2, 0, 2],
                    })),
                );
            });
            describe('import nlu only', () => {
                it(
                    '!wipeInvolvedCollections, !wipeProject',
                    caught(() => parametrizeTest({ nlu: true, fragments: false }, {
                        groupLength: 1,
                        oldSegments: true,
                        newSegments: false,
                        exampleLength: 9,
                        exampleComboLength: [4, 2, 1, 2],
                    })),
                );
                it(
                    'wipeInvolvedCollections',
                    caught(() => parametrizeTest({ nlu: true, fragments: false, wipeInvolvedCollections: true }, {
                        groupLength: 1,
                        oldSegments: true,
                        newSegments: false,
                        exampleLength: 8,
                        exampleComboLength: [3, 2, 1, 2],
                    })),
                );
                it(
                    'wipeProject',
                    caught(() => parametrizeTest({ nlu: true, fragments: false, wipeProject: true }, {
                        groupLength: 0,
                        oldSegments: false,
                        newSegments: false,
                        exampleLength: 7,
                        exampleComboLength: [3, 2, 0, 2],
                    })),
                );
            });
            describe('import fragments only', () => {
                it(
                    '!wipeInvolvedCollections, !wipeProject',
                    caught(() => parametrizeTest({ nlu: false, fragments: true }, {
                        groupLength: 3,
                        oldSegments: true,
                        newSegments: true,
                        exampleLength: 3,
                        exampleComboLength: [2, 0, 1, 0],
                    })),
                );
                it(
                    'wipeInvolvedCollections',
                    caught(() => parametrizeTest({ nlu: false, fragments: true, wipeInvolvedCollections: true }, {
                        groupLength: 2,
                        oldSegments: false,
                        newSegments: true,
                        exampleLength: 3,
                        exampleComboLength: [2, 0, 1, 0],
                    })),
                );
                it(
                    'wipeProject',
                    caught(() => parametrizeTest({ nlu: false, fragments: true, wipeProject: true }, {
                        groupLength: 2,
                        oldSegments: false,
                        newSegments: true,
                        exampleLength: 0,
                        exampleComboLength: [0, 0, 0, 0],
                    })),
                );
            });
        });
    });
}
