const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai');
const expect = chai.expect;
const app = require('../../app');
chai.config.includeStack = true;
const { NLUModels } = require('../../models/models');

before(function(done) {
    const fs = require('fs');
    const modelsFile = __dirname + '/../nlu_models/test_data/nlu_models.json';
    const models = JSON.parse(fs.readFileSync(modelsFile, 'utf8'));
    NLUModels.insertMany(models).then(function() {
        done();
    }).catch(e => console.log(e));
});

describe('## Utterance API', () => {
    describe('# POST /log-utterance', () => {
        it('should fail logging an empty utterance', done => {
            request(app)
                .post('/log-utterance')
                .send({})
                .expect(httpStatus.BAD_REQUEST)
                .then(res => {
                    expect(res.body).to.deep.equal({ error: 'An existing modelId is required' });
                    done();
                })
                .catch(done);
        });

        it('should fail logging an utterance with a non existing modelId', done => {
            request(app)
                .post('/log-utterance')
                .send({
                    parse_data: { intent: { name: 'test', confidence: 0.99 }, text: 'blsbla' },
                    modelId: 'rWM8MABzYM2QAsL6g',
                })
                .expect(httpStatus.BAD_REQUEST)
                .then(res => {
                    expect(res.body).to.deep.equal({ error: 'An existing modelId is required' });
                    done();
                })
                .catch(done);
        });

        it('should succeed adding new valid utterance', done => {
            const payload = {
                parse_data: { intent: { name: 'test', confidence: 0.99 }, text: 'blsbla' },
                modelId: '123',
            };

            request(app)
                .post('/log-utterance')
                .send(payload)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.text).to.equal(payload.parse_data.text);
                    expect(res.body.confidence).to.equal(payload.parse_data.intent.confidence);
                    expect(res.body.entities).to.deep.equal([]);
                    expect(res.body.createdAt).to.exist;
                    expect(res.body.updatedAt).to.exist;
                    done();
                })
                .catch(done);
        });

        it('should fail adding utterance with invalid entity', done => {
            const payload = {
                parse_data: {
                    intent: { name: 'test', confidence: 0.99 },
                    text: 'blsbla',
                    entities: [
                        {
                            entity: 'test',
                            value: 'value',
                        },
                    ],
                },
                modelId: '123',
            };
            request(app)
                .post('/log-utterance')
                .send(payload)
                .expect(httpStatus.BAD_REQUEST)
                .then(() => done())
                .catch(done);
        });

        it('should filter duckling entities entity', done => {
            const payload = {
                parse_data: {
                    intent: { name: 'test', confidence: 0.99 },
                    text: 'sadfsdfas',
                    entities: [
                        {
                            entity: 'test',
                            value: 'value',
                            start: 0,
                            end: 1,
                            extractor: 'ner_crf',
                        },
                        {
                            entity: 'test',
                            value: 'value',
                            start: 0,
                            end: 1,
                            extractor: 'ner_duckling_http',
                        },
                    ],
                },
                modelId: '123',
            };
            request(app)
                .post('/log-utterance')
                .send(payload)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.entities).to.deep.equal([
                        {
                            entity: 'test',
                            value: 'value',
                            processors: [],
                            start: 0,
                            end: 1,
                            extractor: 'ner_crf',
                        },
                    ]);
                    done();
                })
                .catch(done);
        });
    });

    describe('# POST /log-utterance', () => {});
});
