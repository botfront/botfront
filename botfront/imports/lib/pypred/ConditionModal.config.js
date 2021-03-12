import { BasicConfig } from 'react-awesome-query-builder';
import React from 'react';
import ConditionInput from '../../ui/components/forms/graph/ConditionSubComponents/ConditionInput';
import ConditionDropdown from '../../ui/components/forms/graph/ConditionSubComponents/ConditionDropdown';
import ConditionButton from '../../ui/components/forms/graph/ConditionSubComponents/ConditionButton';
import ConditionConjunction from '../../ui/components/forms/graph/ConditionSubComponents/ConditionConjunction';
import ConditionMultiselect from '../../ui/components/forms/graph/ConditionSubComponents/ConditionMultiselect';

export const QbConfig = {
    ...BasicConfig,
    conjunctions: {
        ...BasicConfig.conjunctions,
        AND: {
            ...BasicConfig.conjunctions.AND,
            formatConj: (children, _, not) => (children.size > 1
                ? `${(not ? 'not' : '')}(${children.join(' and ')})`
                : `${not ? 'not ' : ''}${children.first()}`),
        },
        OR: {
            ...BasicConfig.conjunctions.OR,
            formatConj: (children, _, not) => (children.size > 1
                ? `${(not ? 'not' : '')}(${children.join(' or ')})`
                : `${not ? 'not ' : ''}${children.first()}`),
        },
    },
    settings: {
        renderField: settings => <ConditionDropdown {...settings} />,
        renderOperator: settings => <ConditionDropdown {...settings} />,
        renderConjs: settings => <ConditionConjunction {...settings} />,
        renderButton: settings => <ConditionButton {...settings} />,
    },
    fields: {
        text: {
            type: 'custom_text',
        },
    },
    operators: {
        is_exactly: {
            label: 'is exactly',
            reversedOp: '',
            formatOp: (field, op, value) => `${field} is ${value}`,
        },
        is_in: {
            label: 'is any of',
            reversedOp: '',
            jsonLogic: 'anyof',
            formatOp: (field, op, value) => `${field} is anyof ${value}`,
        },
        contains: {
            label: 'contains',
            reversedOp: '',
            jsonLogic: 'ct',
            formatOp: (field, op, value) => `${field} contains ${value}`,
        },
        ctanyof: {
            label: 'contains any of',
            reversedOp: '',
            jsonLogic: 'ctanyof',
            formatOp: (field, op, value) => `${field} contains anyof ${value}`,
        },
        ctallof: {
            label: 'contains all of',
            reversedOp: '',
            jsonLogic: 'ctallof',
            formatOp: (field, op, value) => `${field} contains allof ${value}`,
        },
        longer: {
            label: 'has a character count greater than',
            reversedOp: '',
            formatOp: (_, __, value) => (value >= 0 ? value : 0),
        },
        longer_or_equal: {
            label: 'has a character count greater than or equal to',
            reversedOp: '',
            formatOp: (_, __, value) => (value >= 0 ? value : 0),
        },
        shorter: {
            label: 'has a character count less than',
            reversedOp: '',
            formatOp: (_, __, value) => (value >= 0 ? value : 0),
        },
        shorter_or_equal: {
            label: 'has a character count less than or equal to',
            reversedOp: '',
            formatOp: (_, __, value) => (value >= 0 ? value : 0),
        },
        word: {
            label: 'is a single word, with no whitespace or special characters',
            reversedOp: '',
            formatOp: () => (true),
        },
        starts_with: {
            label: 'starts with',
            reversedOp: '',
            formatOp: (field, op, value) => `${field} ${op} ${value}`,

        },
        ends_with: {
            label: 'ends with',
            reversedOp: '',
            formatOp: (field, op, value) => `${field} ${op} ${value}`,
        },
        matches: {
            label: 'matches a regex expression',
            reversedOp: '',
            jsonLogic: 'matches',
            formatOp: (field, op, value) => `${field} ${op} ${value}`,
        },
        eq: {
            label: 'is',
            jsonLogic: '==',
            formatOp: (field, op, value) => `${field} is ${value}`,
        },
        neq: {
            label: 'is not',
            jsonLogic: '!=',
            formatOp: (field, op, value) => `${field} is not ${value}`,
        },
        truthy: {
            label: 'is truthy',
            jsonLogic: 'truthy',
            formatOp: field => `${field}`,
        },
        gt: {
            label: 'is greater than',
            jsonLogic: '>',
            formatOp: (field, op, value) => `${field} > ${value}`,
        },
        gte: {
            label: 'is greater than or equal to',
            jsonLogic: '>=',
            formatOp: (field, op, value) => `${field} >= ${value}`,
        },
        lt: {
            label: 'is less than',
            jsonLogic: '<',
            formatOp: (field, op, value) => `${field} < ${value}`,
        },
        lte: {
            label: 'is less than or equal to',
            jsonLogic: '<=',
            formatOp: (field, op, value) => `${field} <= ${value}`,
        },
        email: {
            label: 'is an email',
            reversedOp: '',
            formatOp: (field, op, value) => `${field} ${op} ${value}`,
        },
    },
    widgets: {
        ...BasicConfig.widgets,
        custom_text: {
            ...BasicConfig.widgets.text,
            formatValue: val => val,
            type: 'custom_text',
            factory: settings => <ConditionInput {...settings} className='custom-text' />,
        },
        custom_number: {
            ...BasicConfig.widgets.number,
            formatValue: val => val,
            type: 'custom_text',
            factory: settings => <ConditionInput {...settings} inputType='number' className='custom-number' placeholder='Number' />,
        },
        positive_number: {
            ...BasicConfig.widgets.number,
            formatValue: val => val,
            type: 'custom_text',
            factory: settings => <ConditionInput {...settings} inputType='number' min={0} className='custom-number' placeholder='Number' />,
        },
        custom_multiselect: {
            ...BasicConfig.widgets.multiselect,
            formatValue: val => val,
            type: 'custom_text',
            factory: settings => <ConditionMultiselect {...settings} className='custom-multiselect' />,
        },
        custom_blank: {
            type: 'custom_text',
            formatValue: val => val,
            factory: () => <></>,
        },
    },
    types: {
        custom_text: {
            operators: [
                'shorter_or_equal',
                'longer_or_equal',
                'starts_with',
                'is_exactly',
                'ends_with',
                'contains',
                'matches',
                'is_in',
                'word',
                'neq',
                'eq',
                'gt',
                'lt',
                'gte',
                'lte',
                'email',
                'truthy',
                'longer',
                'shorter',
                'ctanyof',
                'ctallof',
            ],
            widgets: {
                custom_text: {
                    operators: [
                        'starts_with',
                        'is_exactly',
                        'ends_with',
                        'matches',
                        'neq',
                        'is',
                        'is_in',
                        'matches',
                        'ctanyof',
                        'ctallof',
                        'contains',
                    ],
                },
                custom_number: {
                    operators: [
                        'gt',
                        'gte',
                        'lt',
                        'lte',
                    ],
                },
                positive_number: {
                    operators: [
                        'longer',
                        'longer_or_equal',
                        'shorter',
                        'shorter_or_equal',
                    ],
                },
                custom_blank: {
                    operators: [
                        'word',
                        'email',
                        'truthy',
                    ],
                },
            },
        },
    },
};
