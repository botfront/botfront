import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';

import { renameIntentsInTemplates } from './nlu_model';

// several intents
// several intents in one nlu property
const projectTemplates1 = [
    {
        match: {
            nlu: [],
        },
    },
    {
        match: {
            nlu: [
                {
                    intent: 'test',
                },
            ],
        },
    },
    {
        match: {
            nlu: [
                {
                    intent: 'test',
                    entities: [],
                },
                { intent: 'test' },
            ],
        },
    },
];

// no intents
// no match property
// no nlu property
const projectTemplates2 = [
    {
        match: {
            nlu: [],
        },
    },
    {},
    {
        match: {},
    },
];

// one intent
const projectTemplates3 = [
    {
        match: {
            nlu: [{ intent: 'test' }],
        },
    },
    {
        match: {
            nlu: [{ intent: 'bar' }],
        },
    },
    {
        match: {
            nlu: [{ intent: 'try' }],
        },
    },
];

if (Meteor.isTest) {
    describe('renaming intents in templates', function () {
        it('renames several intents and several intents in one nlu property', function () {
            const output = renameIntentsInTemplates(projectTemplates1, 'test', 'foo');
            expect(output[1].match.nlu[0].intent).to.be.equal('foo');
            expect(output[2].match.nlu[0].intent).to.be.equal('foo');
            expect(output[2].match.nlu[1].intent).to.be.equal('foo');
        });

        it('doesnt crash on renaming templates with no matching intents and no nlu property', function () {
            const output = renameIntentsInTemplates(projectTemplates2, 'test', 'foo');
            expect(output).to.deep.equal(projectTemplates2);
        });

        it('renames one intent', function () {
            const output = renameIntentsInTemplates(projectTemplates3, 'test', 'foo');
            expect(output[0].match.nlu[0].intent).to.be.equal('foo');
            const modifiedExample3 = projectTemplates3;
            modifiedExample3[0].match.nlu[0].intent = 'foo';
            expect(output).to.deep.equal(modifiedExample3);
        })

    });
} 