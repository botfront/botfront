import React from 'react';

export const GraphContext = React.createContext({
    shiftKey: false,
});


const conditionRuleStep = (rule) => {
    const { properties: { value: [value], operator } } = rule;
    switch (operator) {
    case 'word':
    case 'email':
        return true;
    case 'matches':
    case 'is_in':
    case 'is_exactly':
    case 'contains':
    case 'starts_with':
    case 'ends_with':
        return !!value && value.length > 0;
    case 'longer':
    case 'longer_or_equal':
    case 'shorter':
    case 'shorter_or_equal':
    case 'eq':
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':
        return value === 0 || !!value;
    default:
        return false;
    }
};

const conditionGroupStep = (group) => {
    if (!group.children1) return group;
    const cleanedGroup = group;
    if (!cleanedGroup.properties || !cleanedGroup.properties.conjunction) {
        cleanedGroup.properties = { conjunction: 'AND' };
    }
    const children1 = Object.keys(group.children1).reduce((acc, key) => {
        const child = group.children1[key];
        if (child.type === 'rule' && conditionRuleStep(group.children1[key])) {
            return { ...acc, [key]: group.children1[key] };
        } if (child.type === 'group') {
            const filteredChildren = conditionGroupStep(group.children1[key]);
            if (!filteredChildren || !Object.keys(filteredChildren).length) return null;
            return { ...acc, children1: filteredChildren };
        }
        return acc;
    }, {});
    if (!children1 || !Object.keys(children1).length) return null;
    return { ...cleanedGroup, children1 };
};

export const conditionCleaner = (condition) => {
    if (!condition) return null;
    const cleanedCondition = conditionGroupStep(condition);
    if (!cleanedCondition
        || !cleanedCondition.children1
        || !Object.keys(cleanedCondition.children1).length
    ) { return null; }

    return cleanedCondition;
};
