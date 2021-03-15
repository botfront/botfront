import { Utils as QbUtils } from 'react-awesome-query-builder';

import { QbConfig } from './ConditionModal.config';

const { parser } = require('./pypred.parser');

const compiledParser = parser;
// const result = compiledParser.parse('matthieu is not test and philippe is fds');
// console.log({ result });

export const parsePypred = predicate => compiledParser.parse(predicate);

export const defaultSlotField = {
    type: 'custom_text',
    defaultOperator: 'is_exactly',
    fieldSettings: {
        allowCustomValues: true,
        validateValue: () => true,
    },
    valueSources: ['value'],
};

const conditionRuleStep = (rule) => {
    const { properties: { value: [value], operator } } = rule;
    switch (operator) {
    case 'email':
    case 'truthy':
        return true;
    case 'matches':
    case 'is_in':
    case 'is_exactly':
    case 'contains':
    case 'ctanyof':
    case 'ctallof':
    case 'eq':
    case 'neq':
        return !!value && value.length > 0;
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':
        return value === 0 || !!value || (Number.isNaN(parseInt(value, 10)) ? false : parseInt(value, 10));
    default:
        return false;
    }
};

const migrateRule = (rule) => {
    const { properties: { operator } } = rule;
    let newValue = null;
    let alreadyMigrated = false;
    if (operator === 'is_in') {
        if (!Array.isArray(rule.properties.value[0])) {
            alreadyMigrated = true;
        } else {
            newValue = [...rule.properties.value[0]];
            newValue = newValue.map(value => `'${value}'`);
            newValue = `{${newValue.join(' ')}}`;
        }
    }
    switch (operator) {
    case 'is_exactly':
        return {
            ...rule,
            properties: {
                ...rule.properties,
                operator: 'eq',
            },
        };
    case 'email':
        return {
            ...rule,
            properties: {
                ...rule.properties,
                operator: 'matches',
                value: ['"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$)"'],
            },
        };
    case 'is_in':
        if (alreadyMigrated) return { ...rule };
        return {
            ...rule,
            properties: {
                ...rule.properties,
                value: [newValue],
            },
        };
    default:
        return {
            ...rule,
        };
    }
};

// THis is used to remove any rule that might have been started but not finished
// or that got assigned to a value not allowed for that type
// it uses recursivity to only evaluate leaves (objects with the type "rule")
const conditionGroupStep = (group) => {
    if (!group.children1) return group;
    const cleanedGroup = group;
    if (!cleanedGroup.properties || !cleanedGroup.properties.conjunction) {
        cleanedGroup.properties = { conjunction: 'AND' };
    }
    const children1 = Object.keys(group.children1).reduce((acc, key) => {
        const child = group.children1[key];
        if (child.type === 'rule') {
            const rule = migrateRule(child);
            if (conditionRuleStep(rule)) {
                return { ...acc, [key]: rule };
            }
            return acc;
        } if (child.type === 'group') {
            const filteredChildren = conditionGroupStep(group.children1[key]);
            if (!filteredChildren || !Object.keys(filteredChildren).length) return null;
            return { ...acc, [key]: filteredChildren };
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

export const parseJsonLogicToRAQB = (jsonLogic) => {
    const dynamicConfig = { ...QbConfig };
    const configFieldsCopy = { ...QbConfig.fields };
    dynamicConfig.fields = configFieldsCopy;
    
    const jsonJsonLogic = JSON.stringify(jsonLogic);
    let newFields = [...jsonJsonLogic.matchAll(/var":"[\w\d-_]+"/g)];
    newFields = newFields.map(match => match[0].substring(6, match[0].length - 1));
    newFields = [...new Set(newFields)];
    newFields.forEach((match) => {
        dynamicConfig.fields[match] = {
            ...defaultSlotField,
            label: match,
        };
    });


    const immutableTree = QbUtils.loadFromJsonLogic(jsonLogic, dynamicConfig);
    const tree = QbUtils.getTree(immutableTree);
    const cleanedTree = conditionCleaner(tree);
    return cleanedTree;
};

export const exportRQABToPypred = (raqbTree, extraFields) => {
    const dynamicConfig = { ...QbConfig };
    const configFieldsCopy = { ...QbConfig.fields };
    dynamicConfig.fields = configFieldsCopy;

    extraFields.forEach((match) => {
        dynamicConfig.fields[match] = {
            ...defaultSlotField,
            label: match,
        };
    });

    const tree = QbUtils.loadTree(raqbTree, dynamicConfig);
    return QbUtils.queryString(tree, dynamicConfig);
};
