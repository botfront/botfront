import PropTypes from 'prop-types';
import uuidv4 from 'uuid/v4';
import EntityUtils, { entityPropType } from './EntityUtils';

const propertiesBare = ['text', 'entities', 'intent'];
const propertiesExtended = ['text', 'intent', 'entities', 'confidence', 'validated'];
const copy = obj => JSON.parse(JSON.stringify(obj));

export const examplePropType = {
    _id: PropTypes.string,
    text: PropTypes.string.isRequired,
    intent: PropTypes.string,
    entities: PropTypes.arrayOf(PropTypes.shape(entityPropType)),
    confidence: PropTypes.number,
    validated: PropTypes.bool,
    createdAt: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
    color: PropTypes.string,
};

export default class ExampleUtils {
    static validateBare(example, withId = false) {
        let hasAllProperties = true;
        propertiesBare.forEach((prop) => { if (example[prop] === undefined) hasAllProperties = false; });

        const needsAndHasId = !withId || !!example._id;

        return hasAllProperties && needsAndHasId;
    }

    static stripBare(example, withId = true, withSubstringAsEntityValue = false) {
        const {
            _id, text, intent, entities = [], metadata,
        } = example;
        const obj = {
            _id,
            text,
            intent,
            entities: entities.map(entity => EntityUtils.stripBare(entity, withId, withSubstringAsEntityValue ? text.substring(entity.start, entity.end) : undefined)),
            metadata,
        };

        if (!withId || obj._id === undefined) {
            delete obj._id;
        }
        return obj;
    }

    static updateIntent(example, intent) {
        const obj = copy(example);
        obj.intent = intent;

        if (obj.confidence !== undefined) obj.confidence = 1.0;
        return obj;
    }

    static prepareExample(example) {
        const {
            entities = [], text = '', intent = '', ...exampleFields
        } = example;
        const newEntities = entities.filter(EntityUtils.filterDuckling)
            .map(({
                value, start, end, ...entityFields
            }) => ({
                value: text.substring(start, end),
                start,
                end,
                ...entityFields,
            }));

        const newExample = ExampleUtils.stripBare({
            _id: uuidv4(),
            text,
            intent,
            entities: newEntities,
            ...exampleFields,
        });

        if (!newExample.intent) {
            newExample.metadata = { draft: true };
            newExample.intent = ' ';
        }

        return newExample;
    }

    static updateableProps() {
        return propertiesExtended;
    }

    static fromParseData(parseData) {
        const {
            text,
            intent: {
                name: intent,
            },
            entities,
        } = parseData;

        return {
            text,
            intent: intent || 'none',
            entities: entities.filter(({ extractor }) => extractor === 'ner_crf'),
        };
    }

    static getConfidence(parseData) {
        const { intent: { confidence } = {} } = parseData;
        return confidence;
    }

    static sameCanonicalGroup(example, payload) {
        // check if these examples are in the same canonical group
        return (example.intent === payload.intent
        && example.entities.length === payload.entities.length
        && example.entities.every(entity => payload.entities.find(
            payloadEntity => (
                payloadEntity.entity === entity.entity
                    && payloadEntity.value === entity.value
            ),
        ))
        );
    }
}
