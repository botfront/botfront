const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const app = require('../../../app');
const chai = require('chai');
const expect = chai.expect;
chai.config.includeStack = true;
const { modifyResponsesImagesUrls } = require('./deploy')
const { responsesDev, responsesProd } = require('./deploy.test.data')
const { getModelsBucket } = require('../../utils');




//jest.mock('axios');

describe('## Webhooks', () => {
    describe('### Common', () => {
        it('Should recover bucket from env vars and projectId', async () => {
            expect(await getModelsBucket('inexistent_project_id', {}))
                .to.deep.equal({ error: 'unauthorized', status: 401 });
            expect(await getModelsBucket('project_id_without_namespace', {}))
                .to.deep.equal({ error: 'No GC namespace set for project', status: 422 })
            delete process.env.CLUSTER_ENVIRONMENT
            expect(await getModelsBucket('project_id_with_namespace', {}))
                .to.deep.equal({ error: 'No CLUSTER_ENVIRONMENT variable set', status: 422 });
            process.env.CLUSTER_ENVIRONMENT = 'dev';
            delete process.env.GCP_PROJECT_ID
            expect(await getModelsBucket('project_id_with_namespace', {}))
                .to.deep.equal({ error: 'No GCP_PROJECT_ID variable set', status: 422 });
            process.env.GCP_PROJECT_ID = 'project_one';
            expect(await getModelsBucket('project_id_with_namespace', {}))
                .to.deep.equal({ bucket: 'dev-models-yepp-project_one' });
                
        });
    });

    describe('### Deploy route', () => {
        it('should fail when body is empty', async () => {
            await request(app)
                .post('/webhooks/deploy')
                .send({})
                .expect(httpStatus.UNPROCESSABLE_ENTITY);
        });

        it('should fail when mime type is bad', async () => {
            await request(app)
                .post('/webhooks/deploy')
                .send({
                    data: 'xx',
                    projectId: 'project_i',
                    namespace: 'namespace',
                    environment: 'development',
                    mimeType: 'application/json',
                })
                .expect(httpStatus.UNPROCESSABLE_ENTITY);
        });

        it('should fail when archive is corrupt', async () => {
            process.env.CLUSTER_ENVIRONMENT = 'dev';
            await request(app)
                .post('/webhooks/deploy')
                .send({
                    data: 'xxuruhguehrq',
                    projectId: 'project_id_with_namespace',
                    namespace: 'namespace',
                    environment: 'development',
                    mimeType: 'application/x-tar',
                })

                .then((res) => {
                    expect(res.body.message).to.equal('failed while extracting the model file',
                    );
                })

        });

        it('should fail if the gcp project id is not set', async () => {
            await request(app)
                .post('/webhooks/deploy')
                .send({
                    data: 'H4sIAEDMql4AA+2ZwW6CQBRFZ6gLkm5YdjmbbnGQGdwSY7/AD2iNkmqiNbGSpjs+vUPn2mCtJm2kNfWehJwhDsPDlwCPF3cnq3XRFW2ite5bq96deTu29jtJmtmeNZm2idKJMVlfKNtqVKB83ozXLpTHcr5YjMtlsSkms2K9N+9lVhSLI+vsXpRqLd4TE/v8x8PR/WjjRm2cw/0fmTGH8p8Yrc02/2k/rfOfJTYVSrcRzGcuPP8OOSiniRCRG4bCW9x+PTXEtkfQXA9rEEIIIeS8kV7h9d+GQQg5Q+r7g4JzuPKW+D2AO41jIljBOVx5S8wL4A4cwhGs4ByuvHHTkig+JM4sUaFIVCFSwfm3LpmQi+HKK6qf/3fiYP1PCPnHyM5wNByIj4Jgf4LbHhrjShx+CQj8x8KbxrEKzuHKmy8ChBDy26D/N10tx/On+HV5rMX1U473/3b6v0anuu7/GdNj/48QQtrkDWuCP/gAJAAA',
                    projectId: 'project_id_with_namespace',
                    namespace: 'namespace',
                    environment: 'development',
                    mimeType: 'application/x-tar',
                })

                .then((res) => {
                    expect(res.body.message).to.equal('failed while duplicating files on google cloud storage');
                })

        });
    });




    describe('### Deploy utils', () => {
        it('should change images url with environement specifics url', async () => {
            expect(modifyResponsesImagesUrls(responsesDev, 'production'))
                .to.deep.equal(responsesProd);
        });
    });
});



