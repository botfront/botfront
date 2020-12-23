/* eslint-disable no-unused-expressions */
import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import MockAdapter from 'axios-mock-adapter';
import { safeLoad } from 'js-yaml';
import { axiosClient, validateTrainingData } from './validateTrainingData';
import { stories01, stories01_02 } from './test_data/training_data.data';
import { caught } from '../client.safe.utils';

if (Meteor.isClient) return;

const stripIds = (any) => {
    let input = any;
    if (Array.isArray(any)) return [...input].map(i => stripIds(i));
    if (typeof input === 'object') {
        input = { ...input };
        if ('_id' in input) delete input._id;
        if ('checkpoints' in input) delete input.checkpoints;
        Object.keys(input).forEach((k) => {
            input[k] = stripIds(input[k]);
        });
    }
    return input;
};

const navigateToPath = (stories, path) => path.reduce((prev, curr) => {
    const nextLevel = prev.find(s => s._id === curr);
    expect(!!nextLevel).to.be.equal(true);
    return nextLevel.branches.length ? nextLevel.branches : nextLevel;
}, stories);

const fileMappings = {
    'stories01.md': 'stories01.yml',
    'stories02.md': 'stories02.yml',
    'nlu01.md': 'nlu01.json',
    'nlu02.yml': 'nlu02.json',
    'nlu03.yml': 'nlu03.json',
};

const loadTrainingDataFixture = filename => Assets.getText(`fixtures/training_data/${filename}`);

const responses = Object.entries(fileMappings).reduce((acc, [original, converted]) => {
    const loader = converted.endsWith('.json') ? JSON.parse : a => a;
    const chopMdBeforeFirstEntry = original.endsWith('.md')
        ? a => a.substring(a.search(/\n+##/) + 1)
        : a => a;
    const loadYaml = original.endsWith('.yml')
        ? a => JSON.stringify(safeLoad(a))
        : a => a;
    return {
        ...acc,
        [chopMdBeforeFirstEntry(loadYaml(loadTrainingDataFixture(original)))]: loader(
            loadTrainingDataFixture(converted),
        ),
    };
}, {});

const mock = new MockAdapter(axiosClient);
mock.onAny().reply((config) => {
    try {
        const { data } = JSON.parse(config.data);
        const key = typeof data === 'string' ? data : JSON.stringify(data);
        if (!responses[key]) throw new Error();
        return [200, { data: responses[key] }];
    } catch {
        return [500];
    }
});

const generateFileListFromFixtureNames = fixtureNames => fixtureNames.map(filename => ({
    filename,
    rawText: loadTrainingDataFixture(filename),
    dataType: 'training_data',
}));

const generateInitialParams = (overwrite = {}) => ({
    onlyValidate: true,
    projectId: 'bf',
    fallbackLang: 'en',
    projectLanguages: ['en'],
    defaultDomain: {},
    wipeInvolvedCollections: false,
    instanceHost: 'https://mocked',
    existingStoryGroups: [{ _id: 'stock', name: 'stock group' }],
    summary: [],
    ...overwrite,
});

const validateWrapped = (fixtureNames = [], overwrite = {}) => validateTrainingData(
    generateFileListFromFixtureNames(fixtureNames),
    generateInitialParams(overwrite),
);

describe('stories and rules importing', function () {
    describe('from md', () => {
        it(
            'should do a single file validation and warn about a missing checkpoint origin',
            caught(async () => {
                const [[{ stories, warnings }], { summary }] = await validateWrapped([
                    'stories01.md',
                ]);
                expect(stripIds(stories)).to.deep.equal(stripIds(stories01));
                expect(warnings.map(s => s.text)).to.deep.equal([
                    'Story \'Greetings\' refers to a checkpoint \'checkpoint_2\', but no origin counterpart was found.',
                ]);
                expect(summary.map(s => s.text)).to.deep.equal([
                    'Group \'First Story Fixture\' will be created with 1 story.',
                ]);
            }),
        );
        it(
            'should do a two file validation and rebuild branching structure and links from checkpoints',
            caught(async () => {
                const [
                    [
                        { stories: stories1, warnings: warnings1 },
                        { stories: stories2, warnings: warnings2 },
                    ],
                    { summary },
                ] = await validateWrapped(['stories01.md', 'stories02.md']);
                const stories = [...stories1, ...stories2];
                expect(stripIds(stories)).to.deep.equal(stripIds(stories01_02));
                expect(warnings1).to.be.empty;
                expect(warnings2).to.be.empty;
                expect(summary.map(s => s.text)).to.deep.equal([
                    'Group \'First Story Fixture\' will be created with 1 story.',
                    'Group \'Second Story Fixture\' will be created with 2 stories.',
                ]);
                // verify checkpoints
                const { checkpoints: check1 = [] } = stories.find(
                    s => s.title === 'Greetings',
                );
                expect(check1.length).to.be.equal(1);
                expect(stripIds(navigateToPath(stories, check1[0])).title).to.be.equal(
                    'Farewells',
                );
                const { checkpoints: check2 = [] } = stories.find(
                    s => s.title === 'Farewells',
                );
                expect(check2.length).to.be.equal(2);
                expect(stripIds(navigateToPath(stories, check2[0])).title).to.be.equal(
                    'New Branch 1',
                );
                expect(stripIds(navigateToPath(stories, check2[1]).title)).to.be.equal(
                    'New Branch 2',
                );
            }),
        );
    });
    describe('from yaml', () => {
        it(
            'should drop stories on deviant input format, and drop branches when absent',
            caught(async () => {
                const [[{ warnings }], { summary }] = await validateWrapped([
                    'stories_with_problems.yml',
                ]);
                expect(warnings.map(s => s.longText)[0]).to.include(
                    'Intent step not supported in rule condition',
                );
                expect(warnings.map(s => s.longText)[1]).to.include('sandwiched');
                expect(warnings.map(s => s.longText)[2]).to.include(
                    'convention not respected',
                );
                expect(warnings.map(s => s.longText)[3]).to.include('Multiple mothers');
                expect(warnings.map(s => s.longText)[4]).to.include(
                    'more than one destination',
                );
                expect(warnings.map(s => s.longText)[5]).to.include(
                    'convention not respected',
                );
                expect(warnings.map(s => s.longText)[6]).to.include(
                    'Step type not supported',
                );
                expect(warnings.map(s => s.text)[7]).to.include(
                    'branches were not found',
                );
                expect(summary.map(s => s.text)).to.deep.equal([
                    'Group \'stories_with_problems.yml\' will be created with 1 story.',
                ]);
            }),
        );
        it(
            'should group rules and stories in respective groups, and avoid group name collision',
            caught(async () => {
                const [,
                    { summary, wipeFragments, existingStoryGroups },
                ] = await validateWrapped(['stories_and_rules_from_multiple_groups.yml']);
                expect(summary[0].text).to.equal(
                    'Group \'group1\' will be created with 1 rule and 1 story.',
                );
                expect(summary[1].text).to.match(
                    /Group 'stock group (.*)' will be created with 1 story./,
                );
                expect(wipeFragments).to.be.false;
                expect(existingStoryGroups).to.have.length(3);
            }),
        );
        it(
            'should do the same without altering group name when "wipeInvolvedCollections" is true',
            caught(async () => {
                const [,
                    { summary, wipeFragments, existingStoryGroups },
                ] = await validateWrapped(
                    ['stories_and_rules_from_multiple_groups.yml'],
                    { wipeInvolvedCollections: true },
                );
                expect(summary[0].text).to.equal(
                    'ALL EXISTING CONVERSATIONAL FRAGMENTS will be deleted.',
                );
                expect(summary[1].text).to.equal(
                    'Group \'group1\' will be created with 1 rule and 1 story.',
                );
                expect(summary[2].text).to.equal(
                    'Group \'stock group\' will be created with 1 story.',
                );
                expect(wipeFragments).to.be.true;
                expect(existingStoryGroups).to.have.length(2);
            }),
        );
    });
});

describe('nlu data importing', function () {
    describe('from md', () => {
        it(
            'should recover canonical status and language from file and detect missing model accordingly',
            caught(async () => {
                const [
                    [
                        {
                            nlu: {
                                common_examples: examples,
                                regex_features: regex,
                                entity_synonyms: synonyms,
                            },
                            warnings,
                        },
                    ],
                    { summary, wipeNluData, projectLanguages },
                ] = await validateWrapped(['nlu01.md'], {
                    wipeInvolvedCollections: true,
                });
                const canonical = examples.filter(ex => ex?.metadata?.canonical);
                expect(canonical.map(c => c.text)).to.deep.equal([
                    'hey there',
                    'I want to grab lunch',
                    'show me chinese restaurants',
                    'anywhere in the west',
                ]);
                expect(
                    examples.filter(ex => ex?.metadata?.language !== 'fr'),
                ).to.have.lengthOf(0);
                expect(examples).to.have.lengthOf(30);
                expect(regex).to.have.lengthOf(1);
                expect(synonyms).to.have.lengthOf(2);
                expect(warnings).to.deep.equal([
                    {
                        text:
                            'File contains data for French; a new model will be created for that language.',
                    },
                ]);
                expect(summary).to.deep.equal([
                    {
                        text:
                            'A new model with default pipeline will be created for French.',
                    },
                    {
                        text: 'ALL EXISTING NLU DATA for ENGLISH will be deleted.',
                    },
                    {
                        text: '33 NLU data will be imported to French model.',
                        longText:
                            '30 examples, 2 synonyms, 1 regex feature will be imported.',
                    },
                ]);
                expect(wipeNluData).to.deep.equal(['en']);
                expect(projectLanguages).to.deep.equal(['en', 'fr']);
            }),
        );
        it(
            'should validate the same file, but with no model creation when language exists already',
            caught(async () => {
                const [[{ warnings }], { summary, wipeNluData }] = await validateWrapped(
                    ['nlu01.md'],
                    { projectLanguages: ['en', 'fr'], wipeInvolvedCollections: true },
                );
                expect(warnings).to.be.empty;
                expect(summary).to.deep.equal([
                    {
                        text:
                            'ALL EXISTING NLU DATA for ENGLISH, FRENCH will be deleted.',
                    },
                    {
                        text: '33 NLU data will be imported to French model.',
                        longText:
                            '30 examples, 2 synonyms, 1 regex feature will be imported.',
                    },
                ]);
                expect(wipeNluData).to.deep.equal(['en', 'fr']);
            }),
        );
    });
    describe('from yaml', () => {
        it(
            'should validate examples into respective languages, and assign underspecified ones to fallback',
            caught(async () => {
                const [
                    [
                        {
                            nlu: { common_examples: examples },
                            warnings,
                        },
                    ],
                    { summary },
                ] = await validateWrapped(['nlu02.yml'], {
                    projectLanguages: ['en', 'fr'],
                    fallbackLang: 'fr',
                });
                expect(warnings).to.be.empty;
                expect(
                    examples.find(ex => ex?.metadata?.nolanguagespecified).metadata
                        .language,
                ).to.be.equal('fr');
                expect(summary).to.deep.equal([
                    {
                        text: '4 NLU data will be imported to English model.',
                        longText: '4 examples will be imported.',
                    },
                    {
                        text: '3 NLU data will be imported to French model.',
                        longText: '3 examples will be imported.',
                    },
                ]);
            }),
        );
    });
    describe('from json', () => {
        it(
            'should import from two files',
            caught(async () => {
                const [
                    [{ warnings: warnings1 }, { warnings: warnings2 }],
                    { summary },
                ] = await validateWrapped(['nlu01.json', 'nlu02.json'], {
                    projectLanguages: ['fr'],
                    fallbackLang: 'fr',
                });
                expect(warnings1).to.be.empty;
                expect(warnings2).to.deep.equal([
                    {
                        text:
                            'File contains data for English; a new model will be created for that language.',
                    },
                ]);
                expect(summary).to.deep.equal([
                    {
                        text:
                            'A new model with default pipeline will be created for English.',
                    },
                    {
                        text: '36 NLU data will be imported to French model.',
                        longText:
                            '33 examples, 2 synonyms, 1 regex feature will be imported.',
                    },
                    {
                        text: '4 NLU data will be imported to English model.',
                        longText: '4 examples will be imported.',
                    },
                ]);
            }),
        );
    });
});

describe('mixed data importing', function () {
    it(
        'should validate a yaml file with multiple data types',
        caught(async () => {
            const [, { summary }] = await validateWrapped([
                'stories_rules_and_nlu_all_together.yml',
            ]);
            expect(summary).to.be.deep.equal([
                {
                    text: '4 NLU data will be imported to English model.',
                    longText: '2 examples, 1 synonym, 1 regex feature will be imported.',
                },
                {
                    text:
                        'Group \'stories_rules_and_nlu_all_together.yml\' will be created with 1 rule and 2 stories.',
                },
            ]);
        }),
    );
    it(
        'should validate everything at once',
        caught(async () => {
            const [, { summary }] = await validateWrapped([
                'stories_rules_and_nlu_all_together.yml',
                'nlu01.md',
                'nlu02.json',
                'stories_with_problems.yml',
                'stories02.yml',
                'stories01.yml',
                'stories_and_rules_from_multiple_groups.yml',
            ], {
                projectLanguages: ['ch'],
                fallbackLang: 'ch',
            });
            expect(summary.slice(0, summary.length - 1)).to.deep.equal([
                {
                    text: 'A new model with default pipeline will be created for French.',
                },
                {
                    text: 'A new model with default pipeline will be created for English.',
                },
                {
                    text: '5 NLU data will be imported to Chamorro model.',
                    longText: '3 examples, 1 synonym, 1 regex feature will be imported.',
                },
                {
                    text: '35 NLU data will be imported to French model.',
                    longText: '32 examples, 2 synonyms, 1 regex feature will be imported.',
                },
                {
                    text: '4 NLU data will be imported to English model.',
                    longText: '4 examples will be imported.',
                },
                {
                    text: 'Group \'stories_rules_and_nlu_all_together.yml\' will be created with 1 rule and 2 stories.',
                },
                { text: 'Group \'group1\' will be created with 1 rule and 1 story.' },
                {
                    text: 'Group \'stories_with_problems.yml\' will be created with 1 story.',
                },
                { text: 'Group \'stories02.yml\' will be created with 2 stories.' },
                { text: 'Group \'stories01.yml\' will be created with 1 story.' },
            ]);
            expect(summary[summary.length - 1].text).to.match(
                /Group 'stock group (.*)' will be created with 1 story./,
            );
        }),
    );
});
