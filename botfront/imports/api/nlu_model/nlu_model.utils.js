import moment from 'moment';
import { isEqual } from 'lodash';

export const isTraining = (project) => {
    const {
        _id: projectId,
        training,
        training: { startTime, instanceStatus } = {},
    } = project;
    if (!training) {
        return false;
    }
    const statusOk = instanceStatus === 'training' && moment().diff(moment(startTime), 'minutes') < 30;
    const timeStampOk = moment().diff(moment(startTime), 'minutes') < 30;
    if (statusOk && !timeStampOk) {
        // something went wrong and training timed out
        Meteor.call(
            'project.markTrainingStopped',
            projectId,
            'failure',
            'training timed out',
        );
    }
    return !!statusOk && !!timeStampOk;
};

export const getEntitySummary = entities => entities.map(({ entity, value }) => ({ entity, value }));


const compare = (a, b) => {
    if (a.entity < b.entity) {
        return -1;
    }
    if (a.entity > b.entity) {
        return 1;
    }
    return 0;
};

// compate the arrays whitout taking into account the order
const arrayOfObjectsEqual = function(arrayA, arrayB) {
    // use the spread operator to create new arrays, otherwise sort would modify them
    return isEqual([...arrayA].sort(compare), [...arrayB].sort(compare));
};

export const findExampleMatch = (example, item, itemEntities) => {
    if (item.intent !== example.intent) return false; // check examples have the same intent name
    if (item.entities.length !== example.entities.length) return false; // check examples have the same number of entities
    const exampleEntities = getEntitySummary(example.entities);
    return arrayOfObjectsEqual(exampleEntities, itemEntities); // check that the summary of entities values is the same for both items
};

export const canonicalizeExamples = (newExamples, currentExamples) => {
    const seen = {};
    const canonicalizedItems = newExamples.map((item) => {
        const itemEntities = getEntitySummary(item.entities); // give an array of objects { entity: xxx, value: xxxx} as a summary for the entities in the example
        if (
            item.intent in seen
            && seen[item.intent].some(combination => arrayOfObjectsEqual(combination, itemEntities))
        ) {
            return item; // already seen one of those
        }
        seen[item.intent] = [...(seen[item.intent] || []), itemEntities];
        const match = currentExamples.find(example => findExampleMatch(example, item, itemEntities));
        
        return { ...item, metadata: { ...(item.metadata || {}), canonical: !match && !item.metadata.draft } }; // if theres is no matching example, the example is canonical
    });

    return canonicalizedItems;
};
