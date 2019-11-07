import { Meteor } from 'meteor/meteor';
import chai, { expect } from 'chai';
import { stringPayloadToObject, objectPayloadToString } from './story_controller';

if (Meteor.isServer) {
    describe('Story validation', function() {
        it('should convert an intent string payload', function() {
            expect(stringPayloadToObject('/hello')).to.be.deep.equal({
                intent: 'hello',
                entities: [],
            });
        });

        it('should convert an intent/entity string payload', function() {
            expect(stringPayloadToObject('/hello{"ent1":"val1"}')).to.be.deep.equal({
                intent: 'hello',
                entities: [{ entity: 'ent1', value: 'val1' }],
            });
        });

        it('should convert an intent/entities string payload', function() {
            expect(
                stringPayloadToObject('/hello{"ent1":"val1", "ent2":"val2"}'),
            ).to.be.deep.equal({
                intent: 'hello',
                entities: [
                    { entity: 'ent1', value: 'val1' },
                    { entity: 'ent2', value: 'val2' },
                ],
            });
        });

        it('should convert an empty payload', function() {
            expect(stringPayloadToObject('')).to.be.deep.equal({
                entities: [],
                intent: '',
            });
        });

        it('should convert an intent/entities string payload', function() {
            expect(
                stringPayloadToObject('/hello{"ent1":"val1", "ent2":"val2"}'),
            ).to.be.deep.equal({
                intent: 'hello',
                entities: [
                    { entity: 'ent1', value: 'val1' },
                    { entity: 'ent2', value: 'val2' },
                ],
            });
        });

        it('should convert an object to a string payload', function() {
            expect(
                objectPayloadToString({
                    intent: 'hello',
                    entities: [
                        { entity: 'ent1', value: 'val1' },
                        { entity: 'ent2', value: 'val2' },
                    ],
                }),
            ).to.be.equal('/hello{"ent1":"val1","ent2":"val2"}');
        });

        it('should convert an object to a string payload', function() {
            expect(
                objectPayloadToString({
                    intent: 'hello',
                }),
            ).to.be.equal('/hello');
        });

        it('should convert an object to a string payload', function() {
            expect(
                objectPayloadToString({
                    intent: 'hello',
                    entities: [],
                }),
            ).to.be.equal('/hello');
        });
    });
}
