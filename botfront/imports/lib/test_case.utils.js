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
        // eslint-disable-next-line camelcase
        if (event.event === 'bot' && event?.metadata?.template_name?.startsWith('utter')) {
            steps.push({
                // eslint-disable-next-line camelcase
                action: event?.metadata?.template_name,
            });
        }
    });
    return steps;
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
