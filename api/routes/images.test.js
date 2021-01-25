const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const app = require('../app');
const chai = require('chai');
const expect = chai.expect;
chai.config.includeStack = true;
const { Projects } = require('../models/models');
const { getImagesBucket } = require('../server/utils');

const env = { ...process.env };
const projects = [
    { _id: 'project_id_with_namespace', namespace: 'yepp' },
    { _id: 'project_id_without_namespace' },
];

before(async () => {
    await Projects.insertMany(projects);
});

after(() => {
    process.env = env;
});

describe('## Images', () => {
    describe('### Common', () => {
        it('Should recover bucket from env vars and projectId', async () => {
            expect(await getImagesBucket('inexistent_project_id', {}))
                .to.deep.equal({ error: 'unauthorized', status: 401 });
            expect(await getImagesBucket('project_id_without_namespace', {}))
                .to.deep.equal({ error: 'No GC namespace set for project', status: 422 })
            expect(await getImagesBucket('project_id_with_namespace', {}))
                .to.deep.equal({ error: 'No CLUSTER_ENVIRONMENT variable set', status: 422 });
            process.env.CLUSTER_ENVIRONMENT = 'dev';
            expect(await getImagesBucket('project_id_with_namespace', {}))
                .to.deep.equal({ error: 'No GCP_PROJECT_ID variable set', status: 422 });
            process.env.GCP_PROJECT_ID = 'project_one';
            expect(await getImagesBucket('project_id_with_namespace', {}))
                .to.deep.equal({ bucket: 'dev-media-yepp-project_one' });
        });
    });

    describe('### Upload ', () => {
        it('should fail when body is empty', async () => {
            await request(app)
                .post('/webhooks/image/upload')
                .send({})
                .expect(httpStatus.UNPROCESSABLE_ENTITY);
        });

        it('should fail when mime type is bad', async () => {
            await request(app)
                .post('/webhooks/image/upload')
                .send({
                    data: 'xx',
                    projectId: 'project_id_with_namespace',
                    language: 'en',
                    responseId: 'uttsdknd',
                    mimeType: 'application/json',
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY);
        });

        it('should fail when bucket does not exist', async () => {
            await request(app)
                .post('/webhooks/image/upload')
                .send({
                    data: 'xx',
                    projectId: 'project_id_with_namespace',
                    language: 'en',
                    responseId: 'uttsdknd',
                    mimeType: 'image/jpeg',
                })
                .expect(httpStatus.BAD_GATEWAY);
        });
    });

    describe('### Delete ', () => {
        it('should fail when body is empty', async () => {
            await request(app)
                .delete('/webhooks/image/delete')
                .send({})
                .expect(httpStatus.UNPROCESSABLE_ENTITY);
        });

        it('should fail when Uri is bad', async () => {
            await request(app)
                .delete('/webhooks/image/delete')
                .send({
                    uri: 'asas',
                    projectId: 'project_id_with_namespace',
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY);
        });

        it('should fail when bucket does not exist', async () => {
            await request(app)
                .delete('/webhooks/image/delete')
                .send({
                    uri: 'http://a.com/a.jpg?lala',
                    projectId: 'project_id_with_namespace',
                })
                .expect(httpStatus.NOT_FOUND);
        });
    });
});
