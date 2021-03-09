import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';

import { parsePypred } from './pypred.utils';

if (Meteor.isServer) {
    const testCases = [
        {
            predicate: 'patient_age is 20',
            result: { '==': ['patient_age', '20'] },
        },
        {
            predicate: 'patient_age is not 20',
            result: { '!=': ['patient_age', '20'] },
        },
        {
            predicate: 'patient_has_hemoroids',
            result: 'patient_has_hemoroids',
        },
        {
            predicate: 'name is \'Louise\'',
            result: { '==': ['name', '\'Louise\''] },
        },
        {
            predicate: 'not patient_has_hemoroids',
            result: { '!': 'patient_has_hemoroids' },
        },
        {
            predicate:
                '(patient_age < 10 and history_of_injury is \'chemical_burn\') or patient_age > 65',
            result: {
                or: [
                    {
                        and: [
                            { '<': ['patient_age', '10'] },
                            { '==': ['history_of_injury', '\'chemical_burn\''] },
                        ],
                    },
                    { '>': ['patient_age', '65'] },
                ],
            },
        },
        {
            predicate: 'test is not false',
            result: { '!=': ['test', 'false'] },
        },
        {
            predicate:
                'event is \'record_score\' and ((score >= 500 and highest_score_wins) or (score < 10 and lowest_score_wins))',
            result: {
                and: [
                    { '==': ['event', '\'record_score\''] },
                    {
                        or: [
                            { and: [{ '>=': ['score', '500'] }, 'highest_score_wins'] },
                            { and: [{ '<': ['score', '10'] }, 'lowest_score_wins'] },
                        ],
                    },
                ],
            },
        },
        {
            predicate:
                // eslint-disable-next-line max-len
                '(slot1 == "value1" or not slot1) and slot2 is not null and slot3 is anyof {\'value2\' \'value3\' \'value4\' \'value17\' \'value24\'} and slot4 == "value39" and slot5 is not true and slot6 is not true',
            result: {
                and: [
                    {
                        or: [
                            {
                                '==': [
                                    'slot1',
                                    '"value1"',
                                ],
                            },
                            { '!': 'slot1' },
                        ],
                    },
                    {
                        and: [
                            { '!=': ['slot2', 'null'] },
                            {
                                and: [
                                    {
                                        anyof: [
                                            'slot3',
                                            '{\'value2\' \'value3\' \'value4\' \'value17\' \'value24\'}',
                                        ],
                                    },
                                    {
                                        and: [
                                            { '==': ['slot4', '"value39"'] },
                                            {
                                                and: [
                                                    { '!=': ['slot5', 'true'] },
                                                    { '!=': ['slot6', 'true'] },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        },
        {
            predicate:
                'slot1 and slot2 is \'value1\' and slot3 < 10 and (slot4 is true or slot5 is true)',
            result: {
                and: [
                    'slot1',
                    {
                        and: [
                            { '==': ['slot2', '\'value1\''] },
                            {
                                and: [
                                    { '<': ['slot3', '10'] },
                                    {
                                        or: [
                                            { '==': ['slot4', 'true'] },
                                            { '==': ['slot5', 'true'] },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        },
    ];

    describe.only('TEST', () => {
        testCases.forEach((testCase) => {
            it(`parses "${testCase.predicate}" correctly and imports in React Query editor`, () => {
                expect(parsePypred(testCase.predicate)).to.deep.equal(testCase.result);
            });
        });
    });
}
