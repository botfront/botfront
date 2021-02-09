import { BasicConfig } from 'react-awesome-query-builder';
import React from 'react';
import ConditionInput from './ConditionSubComponents/ConditionInput';
import ConditionDropdown from './ConditionSubComponents/ConditionDropdown';
import ConditionButton from './ConditionSubComponents/ConditionButton';
import ConditionConjunction from './ConditionSubComponents/ConditionConjunction';
import ConditionMultiselect from './ConditionSubComponents/ConditionMultiselect';

export const QbConfig = {
    ...BasicConfig,
    settings: {
        renderField: settings => <ConditionDropdown {...settings} />,
        renderOperator: settings => <ConditionDropdown {...settings} />,
        renderConjs: settings => <ConditionConjunction {...settings} />,
        renderButton: settings => <ConditionButton {...settings} />,
    },
    fields: {},
    operators: {
        is_exactly: {
            label: 'is exactly',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        is_in: {
            label: 'is one of',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        contains: {
            label: 'contains',
            reversedOp: '',
            formatOp: (_, __, value) => value,
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
            formatOp: (_, __, value) => value,

        },
        ends_with: {
            label: 'ends with',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        matches: {
            label: 'matches a regex expression',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        eq: {
            label: 'is equal to',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        gt: {
            label: 'is greater than',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        gte: {
            label: 'is greater than or equal to',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        lt: {
            label: 'is less than',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        lte: {
            label: 'is less than or equal to',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        email: {
            label: 'is an email',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
    },
    widgets: {
        ...BasicConfig.widgets,
        custom_text: {
            ...BasicConfig.widgets.text,
            type: 'custom_text',
            factory: settings => <ConditionInput {...settings} className='custom-text' />,
        },
        custom_number: {
            ...BasicConfig.widgets.number,
            type: 'custom_text',
            factory: settings => <ConditionInput {...settings} inputType='number' className='custom-number' placeholder='Number' />,
        },
        positive_number: {
            ...BasicConfig.widgets.number,
            type: 'custom_text',
            factory: settings => <ConditionInput {...settings} inputType='number' min={0} className='custom-number' placeholder='Number' />,
        },
        custom_multiselect: {
            ...BasicConfig.widgets.multiselect,
            type: 'custom_text',
            factory: settings => <ConditionMultiselect {...settings} className='custom-multiselect' />,
        },
        custom_blank: {
            type: 'custom_text',
            factory: () => <></>,
        },
    },
    types: {
        custom_text: {
            operators: [
                'is_exactly',
                'is_in',
                'contains',
                'longer',
                'longer_or_equal',
                'shorter',
                'shorter_or_equal',
                'word',
                'starts_with',
                'ends_with',
                'matches',
                'eq',
                'gt',
                'gte',
                'gte',
                'lt',
                'lte',
                'email',
            ],
            widgets: {
                custom_text: {
                    operators: [
                        'is_exactly',
                        'contains',
                        'starts_with',
                        'ends_with',
                        'matches',
                    ],
                },
                custom_number: {
                    operators: [
                        'eq',
                        'gt',
                        'gte',
                        'lt',
                        'lte',
                    ],
                },
                custom_multiselect: {
                    widgetProps: {
                        items: [],
                    },
                    operators: [
                        'is_in',
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
                    ],
                },
            },
        },
    },
};
