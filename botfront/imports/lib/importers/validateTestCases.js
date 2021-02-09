import { safeLoad } from 'js-yaml';
import { v4 as uuidv4 } from 'uuid';
import { parseTextEntities } from '../client.safe.utils';
import { languages } from '../languages';

const addErrorToFile = (file, error) => ({
    ...file,
    errors: [...(file?.errors || []), error],
});

class TestCaseValidator {
    constructor(params) {
        const {
            storyGroupsUsed,
            existingStoryGroups,
            fallbackLang,
            projectLanguages,
            projectId,
            timestamp,
            wipeProject,
            wipeInvolvedCollections,
            wipeFragments,
            summary,
        } = params;
        this.params = params;
        this.fallbackLang = fallbackLang;
        this.projectLanguages = projectLanguages;
        this.projectId = projectId;
        this.timestamp = timestamp;
        this.existingStoryGroups = existingStoryGroups;
        this.initialGroupsUsed = [...(storyGroupsUsed || [])];
        this.storyGroupsUsed = storyGroupsUsed;
        this.wipeProject = wipeProject;
        this.wipeInvolvedCollections = wipeInvolvedCollections;
        this.wipeFragments = wipeFragments;
        this.summary = summary;

        this.fragments = {};
        this.fallbackStoryGroup = `Tests (${this.timestamp})`;
    }


    addNewStoryGroup = (name) => {
        const group = {
            name,
            _id: uuidv4(),
        };
        this.storyGroupsUsed.push({ ...group });
        this.existingStoryGroups.push({ ...group });
    }

    getNonConflictingGroupName = (initialName) => {
        const name = initialName || this.fallbackStoryGroup;
    
        if (this.wipeProject || this.wipeInvolvedCollections || this.wipeFragments) {
            if (!this.storyGroupsUsed.some(({ name: groupName }) => groupName === name)) {
                this.addNewStoryGroup(name);
            }
            return name;
        }
    
        const hasNameConflict = this.existingStoryGroups.some(({ name: groupName }) => groupName === name)
            && !this.storyGroupsUsed.some(({ name: groupName }) => groupName === name);
        const uniqueName = hasNameConflict ? `${name} (${this.timestamp})` : name;
        
        if (!this.storyGroupsUsed.some(({ name: groupName }) => (groupName === uniqueName))) {
            this.addNewStoryGroup(uniqueName);
        }

        return uniqueName;
    };

    formatTestSteps = steps => steps.reduce((acc, step) => {
        if (step.user) {
            const { user, entities } = parseTextEntities(step.user);
            return [
                ...acc,
                { user, intent: step.intent, entities },
            ];
        }
        if (step.action) {
            return [...acc, step];
        }
        return acc;
    }, []);

    addAsFragment = (story) => {
        const { language, title, metadata: { group } = {} } = story;
        if (!this.fragments[group]) this.fragments[group] = {};
        this.fragments[group][language] = [
            ...(this.fragments[group][language] || []),
            title,
        ];
    };

    createSummary = () => {
        const preExistingGroupNames = this.initialGroupsUsed.reduce(
            (acc, { name }) => ({ ...acc, [name]: true }),
            {},
        );

        let newSummaryLines = Object.keys(this.fragments).map((groupName) => {
            let testsInGroup = [];
            const groupIsNew = preExistingGroupNames[groupName];
            const testsByLanguage = Object.keys(this.fragments[groupName]).reduce(((acc, language) => {
                if (!this.projectLanguages.includes(language)) return acc
                const children = this.fragments[groupName][language];
                testsInGroup = [...testsInGroup, ...children];
                return [...acc, `${children.length} new test${children.length > 1 ? 's' : ''} in ${languages[language]?.name || language}`];
            }), []);
            return {
                text: `Group '${groupName}' will ${groupIsNew ? 'contain' : 'be added with'} ${testsByLanguage.join(', ')}`,
            };
        });
        if (Object.keys(this.fragments).length > 0 && this.wipeInvolvedCollections && !this.wipeProject) {
            this.wipeFragments = true;
            newSummaryLines = [...newSummaryLines, 'ALL EXISTING CONVERSATIONAL FRAGMENTS will be deleted.'];
        }
        return newSummaryLines;
    };

    formatForBotfront = (file, contents) => {
        const testCases = [];
        const warnings = [...(file.warnings || [])];
        const newLanguages = [];
        const newLangTests = {};
    
        contents.stories.forEach((testCase) => {
            const group = this.getNonConflictingGroupName(testCase.metadata?.group);
            const { language = this.fallbackLang } = testCase.metadata;
            const story = {
                language,
                steps: this.formatTestSteps(testCase.steps),
                testResults: [],
                success: true,
                title: testCase.story,
                projectId: this.projectId,
                metadata: { group },
            };
            this.addAsFragment(story); // fragments are used to create the summary
            if (!this.projectLanguages.find(lang => lang === language)) {
                newLanguages.push(language);
                newLangTests[language] = [...(newLangTests[language] || []), story.title];
                return;
            }
            testCases.push(story);
        });

        if (Object.keys(newLangTests).length > 0) {
            Object.keys(newLangTests).forEach((lang) => {
                warnings.push({ text: `${newLangTests[lang].length} test${newLangTests[lang].length > 1 ? 's' : ''} will not be added as ${languages[lang]?.name || lang} is not a project language:`, longText: newLangTests[lang].join(', ') });
            });
        }

        return {
            warnings,
            tests: testCases,
            dataType: 'training_data',
        };
    }

    validateSchema = (contents) => {
        if (!contents?.stories) return 'Test story files must have a \'stories\' key.';
        if (!Array.isArray(contents.stories)) return 'key \'stories\' must be an array';
        return false;
    }

    validateATestCaseFile = (file) => {
        let fileContents;
        try {
            fileContents = safeLoad(file.rawText);
        } catch (e) {
            return addErrorToFile(file, `Not valid yaml: ${e.message}`);
        }
        const schemaError = this.validateSchema(fileContents);
        if (schemaError) return addErrorToFile(file, schemaError);
        const ret = {
            ...file,
            ...this.formatForBotfront(file, fileContents),
        };
        return ret;
    }

    seperateIncomingFiles = (files) => {
        const testCaseFiles = [];
        const otherFiles = [];

        files.forEach((file) => {
            if (/^test_.*\.yml/.test(file?.filename)) {
                testCaseFiles.push(file);
            } else {
                otherFiles.push(file);
            }
        });
        return { testCaseFiles, otherFiles };
    }

    validateTestCases = (files) => {
        try {
            const { testCaseFiles, otherFiles } = this.seperateIncomingFiles(files);
            const validatedFiles = testCaseFiles.map(file => this.validateATestCaseFile(file));
            const newSummaryLines = this.createSummary();
            return [
                [...otherFiles, ...validatedFiles],
                {
                    ...this.params,
                    summary: [...this.summary, ...newSummaryLines],
                    wipeFragments: this.wipeFragments,
                    storyGroupsUsed: this.storyGroupsUsed,
                },
            ];
        } catch (e) {
            throw e;
        }
    }
}

export const validateTestCases = (files, params) => new TestCaseValidator(params).validateTestCases(files);
