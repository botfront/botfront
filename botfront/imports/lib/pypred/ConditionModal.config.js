/* eslint-disable import/no-cycle */
import { BasicConfig } from 'react-awesome-query-builder';
import React from 'react';
import { formatValue } from './pypred.utils';
import ConditionInput from '../../ui/components/forms/graph/ConditionSubComponents/ConditionInput';
import ConditionDropdown from '../../ui/components/forms/graph/ConditionSubComponents/ConditionDropdown';
import ConditionButton from '../../ui/components/forms/graph/ConditionSubComponents/ConditionButton';
import ConditionConjunction from '../../ui/components/forms/graph/ConditionSubComponents/ConditionConjunction';
import ConditionMultiSelect from '../../ui/components/forms/graph/ConditionSubComponents/ConditionMultiSelect';

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
        eq: {
            label: 'is',
            jsonLogic: '==',
            formatOp: (field, op, value) => `${field} is ${formatValue(value)}`,
        },
        neq: {
            label: 'is not',
            jsonLogic: '!=',
            formatOp: (field, op, value) => `${field} is not ${formatValue(value)}`,
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
            formatOp: (field, op, value) => `${field} contains ${formatValue(value)}`,
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
        matches: {
            label: 'matches a regex expression',
            reversedOp: '',
            jsonLogic: 'matches',
            formatOp: (field, op, value) => `${field} ${op} ${value}`,
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
        custom_multiselect: {
            ...BasicConfig.widgets.text,
            formatValue: val => val,
            type: 'custom_text',
            factory: settings => <ConditionMultiSelect {...settings} className='custom-multiselect' />,
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
                'contains',
                'matches',
                'is_in',
                'neq',
                'eq',
                'gt',
                'lt',
                'gte',
                'lte',
                'truthy',
                'ctanyof',
                'ctallof',
            ],
            widgets: {
                custom_text: {
                    operators: [
                        'matches',
                        'neq',
                        'is',
                        'eq',
                        'matches',
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
                custom_multiselect: {
                    operators: [
                        'is_in',
                        'ctanyof',
                        'ctallof',
                    ],
                },
                custom_blank: {
                    operators: [
                        'truthy',
                    ],
                },
            },
        },
    },
};
