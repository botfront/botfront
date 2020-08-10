import PropTypes from 'prop-types';
import { find } from 'lodash';

// properties required in training data
const propertiesBare = ['entity', 'value', 'start', 'end'];
const copy = obj => JSON.parse(JSON.stringify(obj));

export const entityPropType = {
    start: PropTypes.number,
    end: PropTypes.number,
    value: PropTypes.string.isRequired,
    entity: PropTypes.string.isRequired,
    confidence: PropTypes.number,
    extractor: PropTypes.string,
    processors: PropTypes.arrayOf(PropTypes.string),
};

export default class EntityUtils {
    static validateBare(entity, withId = false) {
        let hasAllProperties = true;
        propertiesBare.forEach((prop) => { if (entity[prop] === undefined) hasAllProperties = false; });

        const needsAndHasId = !withId || !!entity._id;

        return hasAllProperties && needsAndHasId;
    }

    static stripBare(ENTITY, withId = true, customValue = '') {
        const {
            _id, start, end, value, entity,
        } = ENTITY;
        const obj = {
            _id,
            start,
            end,
            value: customValue || value,
            entity,
        };

        if (!withId || obj._id === undefined) {
            delete obj._id;
        }

        return obj;
    }

    static getUpdatedExample(example, entity, fields) {
        const exampleCopy = copy(example);
        const entityCopy = find(exampleCopy.entities, EntityUtils.stripBare(entity, false));

        Object.assign(entityCopy, fields);
        if (entityCopy.confidence !== undefined) entityCopy.confidence = 1.0;
        return exampleCopy;
    }

    static filterDuckling(entity) {
        const { extractor = '' } = entity || {};
        return !extractor.startsWith('duckling') && !extractor.startsWith('DucklingHTTPExtractor');
    }
}
