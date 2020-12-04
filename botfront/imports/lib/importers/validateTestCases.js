import { safeLoad } from 'js-yaml';
import { v4 as uuidv4 } from 'uuid';
import { parseTextEntities } from '../utils';
import { languages } from '../languages';

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
        storyGroupsUsed = [],
        existingStoryGroups = [],
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
        ...file,
        warnings: [...(file.warnings || []), ...warnings],
        tests: testCases,
        dataType: 'training_data',
    };
};

const createSummary = (testCaseFiles, initialGroupsUsed = [], params) => {
    const { summary } = params;
    const groupSummary = {};
    const preExistingGroupNames = initialGroupsUsed.reduce(
        (acc, { name }) => ({ ...acc, [name]: true }),
        {},
    );
    
    testCaseFiles.forEach((testCase) => {
        testCase.tests.forEach((test) => {
            const { language, title, metadata: { group } = {} } = test;
            if (!groupSummary[group]) groupSummary[group] = {};
            groupSummary[group][language] = [
                ...(groupSummary[group][language] || []),
                title,
            ];
        });
    });

    const newSummaryLines = Object.keys(groupSummary).map((groupName) => {
        let testsInGroup = [];
        const groupIsNew = preExistingGroupNames[groupName];
        const testsByLanguage = Object.keys(groupSummary[groupName]).map(((language) => {
            const children = groupSummary[groupName][language];
            testsInGroup = [...testsInGroup, ...children];
            return `${children.length} new test${children.length > 1 ? 's' : ''} in ${languages[language]?.name || language}`;
        }));
        return {
            text: `Group '${groupName}' will ${groupIsNew ? 'contain' : 'be added with'} ${testsByLanguage.join(', ')}`,
        };
    });
    return [...summary, ...newSummaryLines];
};

export const validateTestCases = (files, newParams) => {
    const testCaseFiles = [];
    const otherFiles = [];
    const initialUsedGroups = [...(newParams.storyGroupsUsed || {})];
    files.forEach((file) => {
        if (/^test_.*\.yml/.test(file?.filename)) {
            testCaseFiles.push(file);
        } else {
            otherFiles.push(file);
        }
    });
    const validatedFiles = testCaseFiles.map(v => validateATestCase(v, newParams));
    const newSummary = createSummary(validatedFiles, initialUsedGroups, newParams);
    const ret = [
        [...otherFiles, ...validatedFiles],
        {
            ...newParams,
            summary: newSummary,
        },
    ];
    return ret;
};
