import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';

import { parsePypred, parseJsonLogicToRAQB, exportRQABToPypred } from './pypred.utils';

if (Meteor.isServer) {
    const testCases = [
        {
            predicate: 'patient_age is 20',
            result: { '==': [{ var: 'patient_age' }, '20'] },
        },
        {
            predicate: 'patient_age is not 20',
            result: { '!=': [{ var: 'patient_age' }, '20'] },
        },
        {
            predicate: 'patient_has_hemoroids',
            result: { truthy: [{ var: 'patient_has_hemoroids' }, 'truthy'] },
        },
        {
            predicate: 'name is \'Louise\'',
            result: { '==': [{ var: 'name' }, '\'Louise\''] },
        },
        {
            predicate: 'not patient_has_hemoroids',
            result: { '!': { truthy: [{ var: 'patient_has_hemoroids' }, 'truthy'] } },
        },
        {
            predicate:
                '(patient_age < 10 and history_of_injury is \'chemical_burn\') or patient_age > 65',
            result: {
                or: [
                    {
                        and: [
                            { '<': [{ var: 'patient_age' }, '10'] },
                            { '==': [{ var: 'history_of_injury' }, '\'chemical_burn\''] },
                        ],
                    },
                    { '>': [{ var: 'patient_age' }, '65'] },
                ],
            },
        },
        {
            predicate: 'test is not false',
            result: { '!=': [{ var: 'test' }, 'false'] },
        },
        {
            predicate: 'slot1 contains anyof {\'value1\' \'value2\'}',
            result: {
                ctanyof: [
                    { var: 'slot1' },
                    '{\'value1\' \'value2\'}',
                ],
            },
        },
        {
            predicate: 'slot1 contains allof {\'value1\' \'value2\' \'value3\'}',
            result: {
                ctallof: [
                    { var: 'slot1' },
                    '{\'value1\' \'value2\' \'value3\'}',
                ],
            },
        },
        {
            predicate: 'not slot1 contains anyof {\'value1\' \'value2\'}',
            result: {
                '!': { ctanyof: [{ var: 'slot1' }, '{\'value1\' \'value2\'}'] },
            },
        },
        {
            predicate:
                'event is \'record_score\' and ((score >= 500 and highest_score_wins) or (score < 10 and lowest_score_wins))',
            result: {
                and: [
                    { '==': [{ var: 'event' }, '\'record_score\''] },
                    {
                        or: [
                            { and: [{ '>=': [{ var: 'score' }, '500'] }, { truthy: [{ var: 'highest_score_wins' }, 'truthy'] }] },
                            { and: [{ '<': [{ var: 'score' }, '10'] }, { truthy: [{ var: 'lowest_score_wins' }, 'truthy'] }] },
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
                                    { var: 'slot1' },
                                    '"value1"',
                                ],
                            },
                            { '!': { truthy: [{ var: 'slot1' }, 'truthy'] } },
                        ],
                    },
                    {
                        and: [
                            { '!=': [{ var: 'slot2' }, 'null'] },
                            {
                                and: [
                                    {
                                        anyof: [
                                            { var: 'slot3' },
                                            '{\'value2\' \'value3\' \'value4\' \'value17\' \'value24\'}',
                                        ],
                                    },
                                    {
                                        and: [
                                            { '==': [{ var: 'slot4' }, '"value39"'] },
                                            {
                                                and: [
                                                    { '!=': [{ var: 'slot5' }, 'true'] },
                                                    { '!=': [{ var: 'slot6' }, 'true'] },
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
                    { truthy: [{ var: 'slot1' }, 'truthy'] },
                    {
                        and: [
                            { '==': [{ var: 'slot2' }, '\'value1\''] },
                            {
                                and: [
                                    { '<': [{ var: 'slot3' }, '10'] },
                                    {
                                        or: [
                                            { '==': [{ var: 'slot4' }, 'true'] },
                                            { '==': [{ var: 'slot5' }, 'true'] },
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
                // eslint-disable-next-line no-useless-escape
                'server matches "east-web-([\d]+)" and errors contains "CPU_load" and environment != test',
            result: {
                and: [
                    {
                        matches: [
                            { var: 'server' },
                            // eslint-disable-next-line no-useless-escape
                            '"east-web-([\d]+)"',
                        ],
                    },
                    {
                        and: [
                            {
                                ct: [
                                    { var: 'errors' },
                                    '"CPU_load"',
                                ],
                            },
                            {
                                '!=': [
                                    { var: 'environment' },
                                    'test',
                                ],
                            },
                        ],
                    },
                ],
            },
        },
    ];

    const testCasesOnlyJsonLogic = [
        // eslint-disable-next-line max-len
        'location_serviceable is not false and (patient_eligible_feature_labels contains \'mental_health\' or patient_eligible_feature_labels contains \'mental_health_family\' or patient_eligible_feature_labels contains \'mental_health_basic\')',
        'location_serviceable is not false',
        'booking_delay is false and input_health_practitioner_id is null',
        'mental_health_stress_assessment_group is 3 or mental_health_questionnaire_comparision_status_result is "speak_with_mhs"',
        // eslint-disable-next-line no-useless-escape
        'server matches "east-web-([\d]+)" and errors contains "CPU_load" and environment != test',
    ];

    describe('TEST', () => {
        const testPypredImportExport = (pypred) => {
            const jsonLogic = parsePypred(pypred);
    
            const cleanedTree = parseJsonLogicToRAQB(jsonLogic);
    
            const jsonJsonLogic = JSON.stringify(jsonLogic);
            let newFields = [...jsonJsonLogic.matchAll(/var":"[\w\d-_]+"/g)];
            newFields = newFields.map(match => match[0].substring(6, match[0].length - 1));
            newFields = [...new Set(newFields)];
    
            const returnOfThePypred = exportRQABToPypred(cleanedTree, newFields);
    
    
            // This clears all the characters that change when importing exporting
            const cleanPypred = (dirtyPypred) => {
                let returnValue;
                returnValue = dirtyPypred.split('(').join('');
                returnValue = returnValue.split(')').join('');
                returnValue = returnValue.split('is not').join('');
                returnValue = returnValue.split('!=').join('');
                returnValue = returnValue.split('is').join('');
                returnValue = returnValue.split('==').join('');
                return returnValue;
            };
                
                
            expect(cleanPypred(pypred)).to.equal(cleanPypred(returnOfThePypred));
        };

        testCases.forEach((testCase) => {
            it(`parses "${testCase.predicate}" correctly and imports in React Query editor`, () => {
                const jsonLogic = parsePypred(testCase.predicate);
        
                expect(jsonLogic).to.deep.equal(testCase.result);
                parseJsonLogicToRAQB(jsonLogic);
            });
        });

        testCasesOnlyJsonLogic.forEach((testCase) => {
            it(`imports "${testCase}" from pypred to raqb and exports it back`, () => {
                testPypredImportExport(testCase);
            });
        });

        testCases.forEach(({ predicate }) => {
            it(`imports "${predicate}" from pypred to raqb and exports it back`, () => {
                testPypredImportExport(predicate);
            });
        });
    });
}
