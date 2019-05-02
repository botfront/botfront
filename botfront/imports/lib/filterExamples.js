import {find, filter} from "lodash"

export const _buildQuery = (query) => {
    return `(${query.trim().split(/\s+/).join('|')})`;
};

export const _cleanQuery = (query) => {
    return query.replace(/-+\w+/g, '').trim()
};

export const includeSynonyms = (query) => {
    const synRegex = /(-s|--syn|--synonyms')/;
    const match = query.trim().match(synRegex);
    return !!match
};

export const _getValueAndSynonymsForEntity = (entityValue, entitySynonyms) => {
    for (let es of entitySynonyms){
        const tokens = es.synonyms.concat([es.value]);
        if (tokens.indexOf(entityValue) >= 0){
            return tokens;
        }
    }
};

export const _appendSynonymsToText = (example, entitySynonyms) => {
    if (!example.entities)
        return example;
    example.entities.map(e=> {
        const valueAndSynonyms = _getValueAndSynonymsForEntity(example.text.substring(e.start, e.end), entitySynonyms);
        if (valueAndSynonyms){
            if (example.extra)
                example.extra += " " + valueAndSynonyms.join(" ");
            else
                example.extra = valueAndSynonyms.join(" ");
        }
    });
    return example
};




