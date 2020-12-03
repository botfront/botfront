import { safeLoad } from 'js-yaml';
import { v4 as uuidv4 } from 'uuid';
import { parseTextEntities } from '../utils';

export const encodeEntitiesAsText = (text, entities) => {
    if (!entities || !Array.isArray(entities)) return text;
    let encodedText = '';
    let prevEnd = 0;
    const sorted = entities.sort((a, b) => {
        if (a.start < b.start) return -1;
        if (a.start > b.start) return 1;
        return 0;
    });
    sorted.forEach(({
        start, end, entity,
    }) => {
        const between = text.slice(prevEnd, start);
        const entityText = text.slice(start, end);
        encodedText = `${encodedText}${between}[${entityText}]{"entity": "${entity}"}`;
        prevEnd = end;
    });
    return `${encodedText}${text.slice(prevEnd)}`;
};

const formatTestSteps = steps => steps.map((step) => {
    if (step.user) {
        const { user, entities } = parseTextEntities(step.user);
        return {
            user,
            intent: step.intent,
            entities,
        };
    }
    return step;
});

const getNonConflictingGroupName = (initialName, params, fallbackStoryGroup) => {
    const {
        wipeProject,
        wipeInvolvedCollections,
        wipeFragments,
        timestamp,
        storyGroupsUsed,
        existingStoryGroups,
    } = params;
    const name = initialName || fallbackStoryGroup;

    if (wipeProject || wipeInvolvedCollections || wipeFragments) {
        return name;
    }

    const hasNameConflict = existingStoryGroups.some(({ name: groupName }) => groupName === name)
        && !storyGroupsUsed.some(({ name: groupName }) => groupName === name);
    const uniqueName = hasNameConflict ? `${name} (${timestamp})` : name;
    
    if (!storyGroupsUsed.some(({ name: groupName }) => (groupName === uniqueName))) {
        storyGroupsUsed.push({
            name: uniqueName,
            _id: uuidv4(),
        });
        return uniqueName;
    }

    return uniqueName;
};

export const validateATestCase = (file = {}, params) => {
    const {
        fallbackLang,
        projectLanguages,
        projectId,
        timestamp,
    } = params;
    let fileContents;
    try {
        fileContents = safeLoad(file.rawText);
    } catch (e) {
        return {
            ...file,
            errors: [...(file?.errors || []), `Not valid yaml: ${e.message}`],
        };
    }
    const testCases = [];
    const warnings = [];
    const newLanguages = [];
    const newLangTests = {};
    const fallbackStoryGroup = `Tests (${timestamp})`;

    fileContents.stories.forEach((testCase) => {
        const group = getNonConflictingGroupName(testCase.metadata?.group, params, fallbackStoryGroup);
        const { language = fallbackLang } = testCase.metadata;
        const story = {
            language,
            steps: formatTestSteps(testCase.steps),
            testResults: [],
            success: true,
            title: testCase.story,
            projectId,
            metadata: { group },
        };
        if (!projectLanguages.find(lang => lang === language)) {
            newLanguages.push(language);
            newLangTests[language] = [...(newLangTests || []), story.title];
            return;
        }
        testCases.push(story);
    });
    if (Object.keys(newLangTests).length > 0) {
        Object.keys(newLangTests).forEach((lang) => {
            warnings.push({ text: `${newLangTests[lang].length} will not be added as ${lang} is not a project language:`, longText: newLangTests[lang].join(', ') });
        });
    }

    return {
        ...file,
        warnings: [...(file.warnings || []), ...warnings],
        tests: testCases,
        dataType: 'training_data',
    };
};

const createSummary = (testCaseFiles, params) => {
    // const { summary } = params;
    // const groups = {};
    // testCaseFiles.reduce((testCase) => {
    //     const {
    //         metadata: {
    //             group,
    //             language,
    //         } = {},
    //         title,
    //     } = testCase;
    // });
};

export const validateTestCases = (files, newParams) => {
    const testCaseFiles = [];
    const otherFiles = [];
    files.forEach((file) => {
        if (/^test_.*\.yml/.test(file?.filename)) {
            testCaseFiles.push(file);
        } else {
            otherFiles.push(file);
        }
    });
    const validatedFiles = testCaseFiles.map(v => validateATestCase(v, newParams));

    const ret = [
        [...otherFiles, ...validatedFiles],
        {
            ...newParams,
        },
    ];
    return ret;
};
