/* eslint-disable camelcase */
import { safeLoad, safeDump } from 'js-yaml';
import uuidv4 from 'uuid/v4';
import shortid from 'shortid';
import axios from 'axios';
import { languages as LANGUAGES, langFromCode } from '../languages';
import { DialogueFragmentValidator } from '../dialogue_fragment_validator';

const NLU_ENGLISH_MAPPINGS = {
    common_examples: 'example',
    entity_synonyms: 'synonym',
    regex_features: 'regex feature',
    fuzzy_gazette: 'gazette',
};

const CORE_ENGLISH_MAPPINGS = {
    rules: 'rule',
    stories: 'story',
};

const freshNluTally = () => Object.keys(NLU_ENGLISH_MAPPINGS).reduce((acc, curr) => ({ ...acc, [curr]: {} }), {});
const freshCoreTally = () => ({ rules: 0, stories: 0 });

const ENGLISH_MAPPINGS = {
    ...NLU_ENGLISH_MAPPINGS,
    ...CORE_ENGLISH_MAPPINGS,
};

const NLU_HEADERS_IN_MD = [
    '## intent:',
    '## synonym:',
    '## regex:',
    '## lookup:',
    '## gazette:',
];
const NLU_LINES = new RegExp(`(?:${NLU_HEADERS_IN_MD.join('|')})`, 'm');
export const axiosClient = axios.create();

export class TrainingDataValidator {
    constructor({
        instanceHost,
        fallbackLang,
        projectLanguages,
        existingStoryGroups = [],
        wipeCurrent,
        summary,
        ...rest
    }) {
        this.wipeCurrent = wipeCurrent;
        this.instanceHost = instanceHost;
        this.fallbackLang = fallbackLang;
        this.projectLanguagesBefore = projectLanguages;
        this.projectLanguages = projectLanguages;
        this.existingStoryGroups = existingStoryGroups;
        this.summary = summary;
        this.unUsedParams = rest;
        // various state variables to count, deduplicate and validate
        this.existingFragments = {};
        this.existingNlu = {};
        this.groupNameMappings = {};
        this.links = [];
    }

    formatRulesAndStoriesFromLoadedYaml = (data, fallbackGroup = 'Unspecified group') => {
        const output = {};
        const { stories, rules } = data;
        const injectGroupName = (frag) => {
            let group = frag?.metadata?.group;
            if (group) group = this.getNonConflictingGroupName(group);
            else group = this.getNonConflictingGroupName(fallbackGroup);
            return { metadata: { ...(frag.metadata || {}), group } };
        };
        if (stories) {
            output.stories = stories.map(({ story: title, ...frag }) => ({
                ...frag,
                title,
                ...injectGroupName(frag),
            }));
        }
        if (rules) {
            output.rules = rules.map(({ rule: title, ...frag }) => ({
                ...frag,
                title,
                ...injectGroupName(frag),
            }));
        }
        return output;
    };

    getNonConflictingGroupName = (name) => {
        if (this.wipeCurrent) return name;
        let newName = name;
        if (name in this.groupNameMappings) {
            return this.groupNameMappings[name];
        }
        if (this.existingStoryGroups.find(esg => esg.name === name)) {
            newName = `${name} (${new Date()
                .toISOString()
                .replace('T', ' ')
                .replace('Z', '')})`;
            this.groupNameMappings[name] = newName;
        }
        return newName;
    };

    static getLanguageFromMdNluFile = (rawText) => {
        const languageFromFirstLine = (rawText
            .split('\n', 1)[0]
            .match(/^#[^#]lang:(.*)/) || [])[1];
        return Object.keys(LANGUAGES).includes(languageFromFirstLine)
            ? languageFromFirstLine
            : null;
    };

    static getCanonicalFromMdNluFile = (rawText) => {
        const start = rawText.split('# canonical')[1] || '';
        const canonicalAndEnd = start.split('\n\n');
        if (canonicalAndEnd.length > 1) return canonicalAndEnd[0].split('\n- ');
        return [];
    };

    static countAndPluralize = (number, noun, withN = true) => `${withN ? `${number} ` : ''}${
        number !== 1
            ? noun === 'was'
                ? 'were'
                : noun.endsWith('y')
                    ? `${noun.slice(0, noun.length - 1)}ies`
                    : `${noun}s`
            : noun
    }`;

    convertNluToJson = async (rawText, extension) => {
        const { data } = await axiosClient.post(
            `${this.instanceHost}/data/convert/nlu`, {
                data: rawText,
                input_format: extension,
                output_format: 'json',
                language: 'en',
            },
        );
        return data;
    }

    static isNluEmpty = ({
        common_examples = [],
        regex_features = [],
        entity_synonyms = [],
        gazette = [],
    }) => ![common_examples, regex_features, entity_synonyms, gazette].some(
        d => d.length,
    );

    getNluFromFile = async (
        fileData,
        extension,
        { language: specLang, canonicalText } = {},
    ) => {
        let language = specLang || this.fallbackLang;
        let nlu;
        if (fileData && typeof fileData === 'object' && 'rasa_nlu_data' in fileData) {
            nlu = fileData.rasa_nlu_data;
        } else {
            try {
                const res = await this.convertNluToJson(fileData, extension);
                ({ rasa_nlu_data: nlu } = res?.data || {});
                if (!nlu) throw new Error();
            } catch {
                throw new Error(
                    `NLU data in this file could not be parsed by Rasa at ${this.instanceHost}.`,
                );
            }
        }
        if (nlu) {
            delete nlu.lookup_tables;
            if (TrainingDataValidator.isNluEmpty(nlu)) {
                throw new Error('NLU data came back empty from Rasa.');
            }
            nlu.common_examples = (nlu.common_examples || []).map((example) => {
                if (example?.metadata?.language) {
                    ({ language } = example.metadata);
                }
                return {
                    ...example,
                    metadata: {
                        ...(example.metadata || {}),
                        language,
                        ...(canonicalText
                            ? { canonical: canonicalText.includes(example.text) }
                            : {}),
                    },
                };
            });
        }
        if (!language) language = this.fallbackLang;
        // even though language is found in individual examples metadata, we also
        // store it as a file-level property. This is because the schema for other
        // nlu data (e.g. synonyms) don't allow for metadata. For these, we have to
        // use this file level property
        return { ...nlu, language };
    };

    loadFromYaml = async (file) => {
        let {
            stories, rules, nlu, errors,
        } = {};
        try {
            ({ nlu, stories, rules } = safeLoad(file.rawText));
            if (!nlu && !stories && !rules) throw new Error();
        } catch {
            return false;
        }
        try {
            nlu = nlu ? await this.getNluFromFile(safeDump({ nlu }), 'yaml') : {};
        } catch (error) {
            errors = [error.message];
        }
        return {
            ...this.formatRulesAndStoriesFromLoadedYaml(
                { stories, rules },
                file.filename,
            ),
            nlu,
            errors,
        };
    };

    loadFromJson = async (file) => {
        let parsed;
        try {
            parsed = JSON.parse(file.rawText);
        } catch {
            return false;
        }
        try {
            return { nlu: await this.getNluFromFile(parsed, 'json') };
        } catch (error) {
            return { errors: [error.message] };
        }
    };

    loadNluFromMd = async (file) => {
        const language = TrainingDataValidator.getLanguageFromMdNluFile(file.rawText);
        const canonicalText = TrainingDataValidator.getCanonicalFromMdNluFile(
            file.rawText,
        );
        try {
            const nlu = await this.getNluFromFile(file.rawText, 'md', {
                language,
                canonicalText,
            });
            return nlu;
        } catch (error) {
            return { errors: [error.message] };
        }
    };

    validateCommonExamples = (examples, filename) => {
        const droppedExamples = {};
        const warnings = [];
        const filteredExamples = examples.filter((ex) => {
            const { language = this.fallbackLang } = ex.metadata || {};
            const { text } = ex;
            if (!(language in this.existingNlu)) {
                this.existingNlu[language] = freshNluTally();
            }
            if (this.existingNlu[language].common_examples[text]) {
                droppedExamples[language] = [
                    ...(droppedExamples[language] || []),
                    [text, this.existingNlu[language].common_examples[text]],
                ];
                return false;
            }
            this.existingNlu[language].common_examples[text] = filename;
            if (!this.projectLanguages.includes(language)) {
                this.projectLanguages.push(language);
                this.summary.push({
                    text: `A new model with default pipeline will be created for ${langFromCode(
                        language,
                    )}.`,
                });
                warnings.push({
                    text: `File contains data for ${langFromCode(
                        language,
                    )}; a new model will be created for that language.`,
                });
            }
            return true;
        });
        Object.keys(droppedExamples).forEach(lang => warnings.push({
            text: `${droppedExamples[lang].length} ${langFromCode(
                lang,
            )} examples dropped.`,
            longText: `${TrainingDataValidator.countAndPluralize(
                droppedExamples[lang].length,
                'Example',
                false,
            )} ${droppedExamples[lang]
                .map(ex => `'${ex[0]}'`)
                .join(', ')} ${TrainingDataValidator.countAndPluralize(
                droppedExamples[lang].length,
                'was',
                false,
            )} dropped because same text was found in an import file (${Array.from(
                new Set(droppedExamples[lang].map(ex => `${ex[1]}`)),
            ).join(', ')}).`,
        }));
        return [warnings, filteredExamples];
    };

    validateGenericNluData = (nluData = {}, key) => {
        if (!(key in nluData)) return;
        const lang = nluData.language;
        if (lang && !(lang in this.existingNlu)) {
            this.existingNlu[lang] = freshNluTally();
        }
        nluData[key].forEach(() => {
            this.existingNlu[lang][key][uuidv4()] = true;
        });
    };

    loadFromMd = async (file) => {
        if (file.rawText.match(NLU_LINES)) return { nlu: await this.loadNluFromMd(file) };
        return this.loadStoriesFromMd(file);
    };

    loadFile = async (file) => {
        let loadedFile = await this.loadFromYaml(file);
        if (!loadedFile) loadedFile = await this.loadFromJson(file);
        if (!loadedFile) loadedFile = await this.loadFromMd(file);
        return { ...file, ...loadedFile };
    };

    getGroupNameAndBodyFromMdStoryFile = (file) => {
        const [firstLine, ...rest] = file.rawText.trim().split('\n');
        let group = (firstLine.trim().match(/^#[^#](.*)/) || [])[1];
        let rawTextWithoutGroupName = rest.join('\n');
        if (!group) {
            group = file.filename;
            rawTextWithoutGroupName = file.rawText;
        }
        return [group, rawTextWithoutGroupName];
    };

    loadStoriesFromMd = async (file) => {
        const [group, mdFragments] = this.getGroupNameAndBodyFromMdStoryFile(file);
        if (
            !mdFragments
                .replace(/(<!--.*?-->)|(<!--[\S\s]+?-->)|(<!--[\S\s]*?$)/g, '')
                .trim()
        ) {
            return {
                errors: ['File is empty.'],
            };
        }
        try {
            const { data: { data = '' } = {} } = await axiosClient.post(
                `${this.instanceHost}/data/convert/core`,
                {
                    data: mdFragments,
                    input_format: 'md',
                    output_format: 'yaml',
                },
            );
            return this.formatRulesAndStoriesFromLoadedYaml(safeLoad(data), group);
        } catch {
            return {
                errors: [
                    `Dialogue fragments in this file could not be parsed by Rasa at ${this.instanceHost}.`,
                ],
            };
        }
    };

    incrementFragmentsForGroup = (group, type) => {
        if (!this.existingFragments[group]) {
            this.existingFragments[group] = freshCoreTally();
            if (!this.existingStoryGroups.find(esg => esg.name === group)) {
                this.existingStoryGroups.push({
                    name: group,
                    _id: uuidv4(),
                });
            }
        }
        this.existingFragments[group][type] += 1;
    };

    validateRules = (rules) => {
        const warnings = [];
        const dropped = {};
        const filteredRules = rules.filter((rule) => {
            if (rule.condition && rule.conversation_start) {
                dropped[rule.title] = [
                    ...(dropped[rule.title] || []),
                    'Cannot have conditions set while conversation_start is true',
                ];
                return false;
            }
            const errors = [
                ...new DialogueFragmentValidator({
                    mode: 'rule_condition',
                }).validateYamlFragment(safeDump(rule.condition || [])),
                ...new DialogueFragmentValidator({
                    mode: 'rule_steps',
                }).validateYamlFragment(safeDump(rule.steps || [])),
            ].filter(a => a.type === 'error');
            if (errors.length) {
                dropped[rule.title] = [
                    ...(dropped[rule.title] || []),
                    ...errors.map(({ text }) => text),
                ];
                return false;
            }
            this.incrementFragmentsForGroup(rule?.metadata?.group, 'rules');
            return true;
        });
        Object.keys(dropped).forEach(title => warnings.push({
            text: `Rule '${title}' dropped.`,
            longText: `Reason: ${dropped[title].join(' ')}`,
        }));
        return [warnings, filteredRules];
    };

    static splitStoryBody = (steps = []) => {
        const parts = { header: [], body: [], footer: [] };
        steps.forEach(({ checkpoint, ...rest }) => {
            if (checkpoint) {
                if (!parts.body.length) parts.header.push(checkpoint);
                else parts.footer.push(checkpoint);
            } else if (parts.footer.length) {
                throw new Error(
                    'A checkpoint sandwiched between other content: bad form.',
                );
            } else {
                parts.body.push(rest);
            }
        });
        return parts;
    };

    static checkStoryHeader = (header, fullTitle) => {
        let ancestorOf = [];
        const linkFrom = [];
        header.forEach((origin) => {
            const motherFromCheckpoint = (origin.match(/(.*)__branches/) || [])[1];
            const motherFromTitle = (fullTitle.replace(/ /g, '_').match(/(.*)__.*/)
                || [])[1];
            if (motherFromCheckpoint || motherFromTitle) {
                if (motherFromCheckpoint !== motherFromTitle) {
                    throw new Error('Branching convention not respected.');
                }
                if (ancestorOf.length) throw new Error('Multiple mothers found.');
                ancestorOf = motherFromCheckpoint.split('__');
            } else {
                linkFrom.push(origin);
            }
        });
        return { ancestorOf, linkFrom };
    };

    static checkStoryFooter = (footer, fullTitle) => {
        let hasDescendents = false;
        let linkTo = null;
        if (!footer.length) return { hasDescendents, linkTo };
        if (footer.length > 1) {
            throw new Error('Story can\'t link to more than one destination');
        }
        const branchingCheckpoint = (footer[0].match(/(.*)__branches/) || [])[1];
        if (branchingCheckpoint && branchingCheckpoint !== fullTitle.replace(/ /g, '_')) {
            throw new Error(
                `Branching convention not respected. -- ${branchingCheckpoint} -- ${fullTitle.replace(
                    / /g,
                    '_',
                )}`,
            );
        }
        if (branchingCheckpoint) hasDescendents = true;
        else [linkTo] = footer;
        return { hasDescendents, linkTo };
    };

    injectStoryParsingMetadata = (story, extra) => {
        const fullTitle = story.title;
        const title = (fullTitle.match(/.*__(.*)/) || [null, fullTitle])[1];
        const { header, body, footer } = TrainingDataValidator.splitStoryBody(
            story.steps,
        );
        const { ancestorOf, linkFrom } = TrainingDataValidator.checkStoryHeader(
            header,
            fullTitle,
        );
        const { hasDescendents, linkTo } = TrainingDataValidator.checkStoryFooter(
            footer,
            fullTitle,
        );

        return {
            ...story,
            title,
            steps: body,
            metadata: {
                ...(story.metadata || {}),
                parsingMetadata: {
                    ...extra,
                    fullTitle,
                    ancestorOf,
                    linkFrom,
                    hasDescendents,
                    linkTo,
                },
            },
        };
    };

    validateStories = (stories, fileIndex) => {
        const warnings = [];
        const dropped = {};
        const filteredAndParsedStories = stories.reduce((acc, story) => {
            const errors = [
                ...new DialogueFragmentValidator({
                    mode: 'story_steps',
                    allowCheckpoints: true,
                }).validateYamlFragment(safeDump(story.steps || [])),
            ].filter(a => a.type === 'error');
            if (errors.length) {
                dropped[story.title] = [
                    ...(dropped[story.title] || []),
                    ...errors.map(({ text }) => text),
                ];
                return acc;
            }
            try {
                return [...acc, this.injectStoryParsingMetadata(story, { fileIndex })];
            } catch (error) {
                dropped[story.title] = [...(dropped[story.title] || []), error.message];
                return acc;
            }
        }, []);
        Object.keys(dropped).forEach(title => warnings.push({
            text: `Story '${title}' dropped.`,
            longText: `Reason: ${dropped[title].join(' ')}`,
        }));
        return [warnings, filteredAndParsedStories];
    };

    addWipingWarnings = () => {
        this.wipeNluData = Object.keys(this.existingNlu).filter(l => this.wipeCurrent && this.projectLanguagesBefore.includes(l));
        this.wipeFragments = this.wipeCurrent && !!Object.keys(this.existingFragments).length;
        if (this.wipeNluData.length) {
            this.summary.push({
                text: `ALL EXISTING NLU DATA for ${this.wipeNluData
                    .map(langFromCode)
                    .join(', ')} will be deleted.`,
            });
        }
        if (this.wipeFragments) {
            this.summary.push({
                text: 'ALL EXISTING CONVERSATIONAL FRAGMENTS will be deleted.',
            });
        }
    };

    addGlobalNluSummaryLines = () => Object.keys(this.existingNlu).forEach((lang) => {
        const { total, ...nByType } = Object.keys(this.existingNlu[lang]).reduce(
            (acc, key) => {
                const n = Object.keys(this.existingNlu[lang][key]).length;
                if (!n) return acc;
                return {
                    ...acc,
                    total: acc.total + n,
                    [key]: TrainingDataValidator.countAndPluralize(
                        n,
                        ENGLISH_MAPPINGS[key],
                    ),
                };
            },
            { total: 0 },
        );
        this.summary.push({
            text: `${total} NLU data will be imported to ${langFromCode(
                lang,
            )} model.`,
            longText: `${Object.values(nByType).join(', ')} will be imported.`,
        });
    });

    addGlobalCoreSummaryLines = () => Object.keys(this.existingFragments).forEach((group) => {
        const { rules, stories } = this.existingFragments[group];
        const nByType = [
            ...(rules > 0
                ? [TrainingDataValidator.countAndPluralize(rules, 'rule')]
                : []),
            ...(stories > 0
                ? [TrainingDataValidator.countAndPluralize(stories, 'story')]
                : []),
        ];
        this.summary.push({
            text: `Group '${group}' will be created with ${nByType.join(' and ')}.`,
        });
    });

    updateLinks = (pathsAndIds) => {
        const { linkTo, currentPath, _id } = pathsAndIds;
        let outputLinks = this.links;
        if (linkTo) {
            outputLinks = [
                ...outputLinks,
                {
                    name: linkTo,
                    path: currentPath,
                    value: [_id],
                },
            ];
        }
        outputLinks.forEach((l, i) => {
            const path = (l.path.match(/(.*)__/) || [])[1];
            if (path === currentPath) {
                outputLinks[i] = { ...l, path, value: [_id, ...l.value] };
            }
        });
        this.links = outputLinks;
    };

    rehydrateStories = (files) => {
        const stories = files.reduce((acc, f) => [...acc, ...(f.stories || [])], []);
        const rehydrated = files.map(f => ({ ...f, stories: [] }));

        const output = { '': [] };
        stories
            .sort(
                (a, b) => b.metadata.parsingMetadata.ancestorOf.length
                    - a.metadata.parsingMetadata.ancestorOf.length,
            ) // sort deepest first
            .forEach((parsedStory) => {
                const {
                    steps,
                    title,
                    metadata: { parsingMetadata, ...metadata },
                } = parsedStory;
                const {
                    hasDescendents,
                    ancestorOf,
                    linkTo,
                    linkFrom,
                    fileIndex,
                } = parsingMetadata;
                const ancestorPath = ancestorOf.join('__');
                const currentPath = `${
                    ancestorPath && `${ancestorPath}__`
                }${title.replace(/ /g, '_')}`;
                const _id = ancestorOf.length
                    ? shortid.generate().replace('_', '0')
                    : uuidv4();

                if (hasDescendents && !output[currentPath]) {
                    rehydrated[fileIndex].warnings.push({
                        text: `Story '${title}' refers to branches, but branches were not found.`,
                    });
                }

                if (!output[ancestorPath]) output[ancestorPath] = [];
                const arrayToPushStoryTo = !ancestorOf.length
                    ? rehydrated[fileIndex].stories
                    : output[ancestorPath];

                arrayToPushStoryTo.push({
                    _id,
                    steps,
                    title,
                    ...(!ancestorOf.length ? { metadata } : {}),
                    branches:
                        hasDescendents && output[currentPath] ? output[currentPath] : [],
                    ...(linkFrom.length ? { checkpoints: linkFrom } : {}),
                });

                this.updateLinks({ linkTo, currentPath, _id });
            });

        rehydrated.forEach(({ stories: rehydratedStories = [] }, index) => {
            rehydratedStories.forEach(
                ({ checkpoints = [], title, metadata = {} }, storyIndex) => {
                    this.incrementFragmentsForGroup(metadata.group, 'stories');
                    const resolvedCheckpoints = [];
                    checkpoints.forEach((c) => {
                        const link = this.links.find(l => l.name === c) || {};
                        if (!link.value) {
                            rehydrated[index].warnings.push({
                                text: `Story '${title}' refers to a checkpoint '${c}', but no origin counterpart was found.`,
                            });
                        } else resolvedCheckpoints.push(link.value);
                    });
                    rehydrated[index].stories[
                        storyIndex
                    ].checkpoints = resolvedCheckpoints;
                },
            );
        });
        return rehydrated;
    };

    validateTrainingData = async (files) => {
        // to do: batch it in chunks
        let trainingDataFiles = await Promise.all(
            files.filter(f => f?.dataType === 'training_data').map(this.loadFile),
        );
        trainingDataFiles = trainingDataFiles.map((file, fileIndex) => {
            let {
                nlu = {}, stories = [], rules = [], warnings = [],
            } = file;
            const { errors = [], filename } = file;
            if (!errors.length) {
                // we don't care about duplicates in synonyms, gazette and regex
                if (nlu.common_examples) {
                    const [newWarnings, filtered] = this.validateCommonExamples(
                        nlu.common_examples,
                        filename,
                    );
                    nlu = { ...nlu, common_examples: filtered };
                    nlu.common_examples = filtered;
                    warnings = [...warnings, ...newWarnings];
                }
                if (rules.length) {
                    const [newWarnings, filtered] = this.validateRules(rules);
                    rules = filtered;
                    warnings = [...warnings, ...newWarnings];
                }
                if (stories.length) {
                    const [newWarnings, filtered] = this.validateStories(
                        stories,
                        fileIndex,
                    );
                    stories = filtered;
                    warnings = [...warnings, ...newWarnings];
                }
                ['entity_synonyms', 'regex_features', 'fuzzy_gazette'].forEach(key => this.validateGenericNluData(nlu, key));
            }
            return {
                ...file,
                nlu,
                stories,
                rules,
                errors,
                warnings,
            };
        });

        trainingDataFiles = this.rehydrateStories(trainingDataFiles);
        this.addWipingWarnings();
        this.addGlobalNluSummaryLines();
        this.addGlobalCoreSummaryLines();

        return [
            files.map((file) => {
                if (file?.dataType !== 'training_data') return file;
                return trainingDataFiles.shift();
            }),
            {
                ...this.unUsedParams,
                wipeCurrent: this.wipeCurrent,
                wipeNluData: this.wipeNluData,
                wipeFragments: this.wipeFragments,
                instanceHost: this.instanceHost,
                fallbackLang: this.fallbackLang,
                projectLanguages: this.projectLanguages,
                existingStoryGroups: this.existingStoryGroups,
                summary: this.summary,
            },
        ];
    };
}

export const validateTrainingData = (files, params) => new TrainingDataValidator(params).validateTrainingData(files);
