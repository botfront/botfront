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

export const getEntityCountDictionary = (entities) => {
    const entitiesCount = {}; // total occurances of each entity
    entities.forEach(({ entity }) => {
        entitiesCount[entity] = entitiesCount[entity] ? entitiesCount[entity] + 1 : 1;
    });
    return entitiesCount;
};

export const findExampleMatch = (example, item, itemEntities) => {
    if (item.intent !== example.intent) return false; // check examples have the same intent name
    if (item.entities.length !== example.entities.length) return false; // check examples have the same number of entities
    const exampleEntities = getEntityCountDictionary(example.entities);
    const entityMatches = Object.keys(itemEntities).filter(
        key => exampleEntities[key] === itemEntities[key],
    );
    return entityMatches.length === Object.keys(itemEntities).length; // check examples have the same entities
};

export const canonicalizeExamples = (newExamples, currentExamples) => {
    const seen = {};
    const canonicalizedItems = newExamples.map((item) => {
        const itemEntities = getEntityCountDictionary(item.entities); // total occurances of each entity in this example
        if (
            item.intent in seen
            && seen[item.intent].some(combination => isEqual(combination, itemEntities))
        ) {
            return item; // already seen one of those
        }
        seen[item.intent] = [...(seen[item.intent] || []), itemEntities];
        const match = currentExamples.find(example => findExampleMatch(example, item, itemEntities));
        return { ...item, metadata: { ...(item.metadata || {}), canonical: !match && !item.metadata.draft } }; // if theres is no matching example, the example is canonical
    });

    return canonicalizedItems;
};
