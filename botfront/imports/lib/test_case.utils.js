import { isEqual } from 'lodash';

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

export const cleanEntity = ({
    entity, value, start, end,
}) => ({
    entity,
    value,
    start,
    end,
});

export const convertTrackerToStory = (tracker) => {
    const steps = [];
    tracker.events.forEach((event) => {
        if (event.event === 'user') {
            steps.push({
                user: event.text,
                entities: (event.parse_data.entities || []).map(cleanEntity),
                intent: event.parse_data.intent.name,
            });
        }
        if (event.event === 'action' && event.name.startsWith('utter')) {
            steps.push({
                action: event.name,
            });
        }
    });
    return steps;
};

export const getBlocks = steps => steps.reduce((acc, current) => {
    const nextAcc = [...acc];
    if (current && (current.user || current.intent)) nextAcc[nextAcc.length] = [];
    nextAcc[nextAcc.length - 1].push(current);
    return nextAcc;
}, []);

export const compareBlocks = (actual, expected) => {
    const expectedBlock = expected;
    let actualBlock = actual;
    const events = [];
    let currentDif;

    expectedBlock.forEach((expectedLine) => {
        const matchindex = actualBlock.findIndex(actualLine => (
            isEqual(actualLine, expectedLine)
        ));

        if (matchindex === 0) {
            // match is first element
            if (currentDif) {
                events.push(currentDif);
                currentDif = null;
            }
            events.push({ type: 'match', steps: [expectedLine] });
            actualBlock = actualBlock.slice(1);
        } else if (matchindex === -1) {
            // no match
            if (!currentDif) currentDif = { type: 'dif', expected: [], actual: [] };
            currentDif.expected.push(expectedLine);
        } else if (matchindex > 0) {
            // match is not the first element
            if (!currentDif) currentDif = { type: 'dif', expected: [], actual: [] };
            currentDif.actual = [...currentDif.actual, ...actualBlock.slice(0, matchindex)];
            events.push(currentDif);
            currentDif = null;
            actualBlock = actualBlock.slice(matchindex + 1, actualBlock.length);
            events.push({ type: 'match', steps: [expectedLine] });
        }
    });
    if (currentDif) {
        if (actualBlock.length > 0) {
            if (!currentDif) currentDif = { type: 'dif', expected: [], actual: [] };
            currentDif.actual = [...currentDif.actual, ...actualBlock];
        }
        events.push(currentDif);
    }
    return events;
};

export const mergeBlocks = (blocks) => {
    let mergedBlocks = [];
    blocks.forEach((block) => {
        block.forEach((section) => {
            if (!mergedBlocks[0]) {
                mergedBlocks = [section];
            } else if (section.type === 'match') {
                if (section.type === mergedBlocks[mergedBlocks.length - 1].type) {
                    section.steps.forEach((step) => {
                        mergedBlocks[mergedBlocks.length - 1].steps.push(step);
                    });
                } else {
                    mergedBlocks = [...mergedBlocks, section];
                }
            } else if (section.type === 'dif') {
                if (section.type === mergedBlocks[mergedBlocks.length - 1].type) {
                    mergedBlocks[mergeBlocks.length - 1].actual = [
                        ...mergedBlocks[mergeBlocks.length - 1].actual,
                        ...section.actual,
                    ];
                    mergedBlocks[mergeBlocks.length - 1].expected = [
                        ...mergedBlocks[mergeBlocks.length - 1].expected,
                        ...section.expected,
                    ];
                } else {
                    mergedBlocks = [...mergedBlocks, section];
                }
            }
        });
    });
    return mergedBlocks;
};

export const compareStorySteps = (expectedSteps, actualSteps) => {
    const expectedBlocks = getBlocks(expectedSteps);
    const actualBlocks = getBlocks(actualSteps);
    const comparedBlocks = expectedBlocks.map((expected, i) => compareBlocks(expected, actualBlocks[i]));
    const mergedBlocks = mergeBlocks(comparedBlocks);
    return mergedBlocks;
};

export const formatTestCaseForRasa = (testCase, storyGroupName) => {
    const story = testCase.title;
    const steps = testCase.steps.map((step) => {
        if (step.user) {
            const user = encodeEntitiesAsText(step.user, step.entities);
            return { user, intent: step.intent };
        }
        return step;
    });
    const metadata = {
        group: storyGroupName,
        language: testCase.language,
    };
    return {
        story,
        steps,
        metadata,
    };
};
