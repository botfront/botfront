import { expect } from 'chai';
import { Meteor } from 'meteor/meteor';
import {
    upsertResponse,
    createResponse, createResponses, createAndOverwriteResponses, upsertFullResponse, deleteVariation,
} from '../mongo/botResponses';

if (Meteor.isServer) {
    import BotResponses from '../botResponses.model';
    
    const projectId = 'bf';
    
    const responseFixture = {
        key: 'utter_TEST',
        values: [
            {
                lang: 'en',
                sequence: [
                    { content: 'text: Hi i am great, how about you?' },
                    { content: 'text: good! how are you?' },
                ],
            },
            {
                lang: 'fr',
                sequence: [
                    { content: 'text: \'sava, et toi?\'\n' },
                ],
            },
        ],
    };
    const responseUpdateFixture = {
        key: 'utter_UPDATE_TEST',
        values: [
            {
                lang: 'en',
                sequence: [
                    { content: 'text: welcome to our website, how can I help?' },
                    { content: 'text: I am botfronts virutal assistant.' },
                ],
            },
            {
                lang: 'fr',
                sequence: [
                    { content: 'text: je suis un assistant virtuel' },
                ],
            },
        ],
    };

    const payloadFixture = {
        text: 'welcome to our website, how can I help?',
    };
    
    const textIndexFixture = 'utter_TEST\nHi i am great, how about you?\ngood! how are you?\nsava, et toi?';
    const updatedIndexFixture = 'utter_UPDATE_TEST\nwelcome to our website, how can I help?\nI am botfronts virutal assistant.\nje suis un assistant virtuel';
    const upsertIndexFixtureA = 'utter_TEST\nwelcome to our website, how can I help?';
    const upsertIndexFixtureB = 'utter_TEST\nHi i am great, how about you?\nwelcome to our website, how can I help?\nsava, et toi?';
    const deleteVariationFixture = 'utter_TEST\nHi i am great, how about you?\nsava, et toi?';

    const testCreateResponse = async (done) => {
        try {
            const result = await createResponse(projectId, responseFixture);
            expect(result.textIndex).to.be.equal(textIndexFixture);
            done();
        } catch (e) {
            done(e);
        }
    };
    const testCreateResponses = async (done) => {
        try {
            await createResponses(projectId, [responseFixture]);
            const response = await BotResponses.findOne({ key: 'utter_TEST' }).lean();
            expect(response.textIndex).to.be.equal(textIndexFixture);
            done();
        } catch (e) {
            done(e);
        }
    };
    const testCreateAndOverwriteResponses = async (done) => {
        try {
            await createAndOverwriteResponses(projectId, [responseFixture]);
            const response = await BotResponses.findOne({ key: 'utter_TEST' }).lean();
            expect(response.textIndex).to.be.equal(textIndexFixture);
            done();
        } catch (e) {
            done(e);
        }
    };
    const testUpdateResponse = async (done) => {
        try {
            const newResponse = await createResponse(projectId, responseFixture);
            await upsertFullResponse(projectId, newResponse._id, responseUpdateFixture);
            const response = await BotResponses.findOne({ key: 'utter_UPDATE_TEST' }).lean();
            expect(response.textIndex).to.be.equal(updatedIndexFixture);
            done();
        } catch (e) {
            done(e);
        }
    };

    const createWithUpsertResponse = async (done) => {
        try {
            const result = await upsertResponse({
                projectId,
                language: 'en',
                key: 'utter_TEST',
                newPayload: payloadFixture,
                index: 0,
            });
            expect(result.textIndex).to.be.equal(upsertIndexFixtureA);
            done();
        } catch (e) {
            done(e);
        }
    };

    const updateWithUpsertResponse = async (done) => {
        try {
            await createResponse(projectId, responseFixture);
            await upsertResponse({
                projectId,
                language: 'en',
                key: 'utter_TEST',
                newPayload: payloadFixture,
                index: 1,
            });
            const response = await BotResponses.findOne({ key: 'utter_TEST' }).lean();
            expect(response.textIndex).to.be.equal(upsertIndexFixtureB);
            done();
        } catch (e) {
            done(e);
        }
    };

    const testDeleteVariation = async (done) => {
        try {
            await createResponse(projectId, responseFixture);
            await deleteVariation({
                projectId, language: 'en', key: 'utter_TEST', index: 1,
            });
            const response = await BotResponses.findOne({ key: 'utter_TEST' }).lean();
            expect(response.textIndex).to.be.equal(deleteVariationFixture);
            done();
        } catch (e) {
            done(e);
        }
    };

    // --------------------------------
    const cleanUpDB = async (done) => {
        await BotResponses.deleteMany({ projectId });
        done();
    };
    describe('test indexing for bot response mutations', () => {
        beforeEach((done) => {
            cleanUpDB(done);
        });
        it('createResponse: generate text index', (done) => {
            testCreateResponse(done);
        });
        it('createResponses: generate text index', (done) => {
            testCreateResponses(done);
        });
        it('createAndOverwriteResponse: generate text index', (done) => {
            testCreateAndOverwriteResponses(done);
        });
        it('updateResponse: generate text index', (done) => {
            testUpdateResponse(done);
        });
        it('upsertResponse: generate text index for new responses', (done) => {
            createWithUpsertResponse(done);
        });
        it('upsertResponse: generate text index for updates', (done) => {
            updateWithUpsertResponse(done);
        });
        it('deleteVariation: generate text index', (done) => {
            testDeleteVariation(done);
        });
    });
}
