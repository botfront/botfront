/* eslint-disable no-underscore-dangle */

export const _buildQuery = query => `(${query
    .trim()
    .split(/\s+/)
    .join('|')})`;

export const _cleanQuery = query => query.replace(/-+\w+/g, '').trim();

export const includeSynonyms = (query) => {
    const synRegex = /(-s|--syn|--synonyms')/;
    const match = query.trim().match(synRegex);
    return !!match;
};

export const _getValueAndSynonymsForEntity = (entityValue, entitySynonyms) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const es of entitySynonyms) {
        const tokens = es.synonyms.concat([es.value]);
        if (tokens.indexOf(entityValue) >= 0) {
            return tokens;
        }
    }
};

export const _appendSynonymsToText = (exampleParam, entitySynonyms) => {
    const example = exampleParam;
    if (!example.entities) return example;
    example.entities.forEach((e) => {
        const valueAndSynonyms = _getValueAndSynonymsForEntity(example.text.substring(e.start, e.end), entitySynonyms);
        if (valueAndSynonyms) {
            if (example.extra) example.extra += ` ${valueAndSynonyms.join(' ')}`;
            else example.extra = valueAndSynonyms.join(' ');
        }
    });
    return example;
};

export const parseTextEntities = (value) => {
    let parsedText = value.text;
    const parsedEntities = [...(value.entities || [])];
    const hasEntity = /\[.*\]{".*":\s*".*"}/g;
    let charIndex = 0;

    const replaceEntities = (matchedText, relativeStart) => {
        const start = relativeStart + charIndex;
        const end = matchedText.replace(/[[]]/g).indexOf(']');
        const pickupAfter = matchedText.indexOf('"}') + 2;
        const entityValue = matchedText.slice(1, end);
        const entityName = matchedText.split(/{"entity":\s*"/)[1].split('"}')[0];
        const valueLength = end - 1;

        parsedEntities.push({
            start, end: start + valueLength, entity: entityName, value: entityValue,
        });

        let newText = `${matchedText.slice(1, end)}${matchedText.slice(pickupAfter)}`;

        if (hasEntity.test(newText)) {
            charIndex += relativeStart;
            newText = newText.replace(hasEntity, replaceEntities);
        }
        return newText;
    };

    if (value.text && hasEntity.test(value.text)) {
        parsedText = value.text.replace(hasEntity, replaceEntities);
    }
    return { ...value, text: parsedText, entities: parsedEntities };
};
