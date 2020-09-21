const request = require('supertest-as-promised');
const chai = require('chai');
const expect = chai.expect;
const app = require('../app');
const fs = require('fs');
chai.config.includeStack = true;
const { Projects } = require('../models/models');
const { allCollections } = require('./port_project');

const dbFile = __dirname + '/test_data/db.json';
const { projects, ...db } = JSON.parse(fs.readFileSync(dbFile, 'utf8'));


const exportPayloads = [];
projects.forEach((project, index) => {
    exportPayloads.push({ project });
    Object.keys(db).forEach(col => {
        const numberOfDocsEach = db[col].length / 2;
        //there two project in the db file so an uneven number of docs in each collection is not possible
        if (!Number.isInteger(numberOfDocsEach)) throw Error(
            `Uneven number of docs in collection ${col}`,
        );
        exportPayloads[index][col] = db[col].slice(
            index * numberOfDocsEach,
            (index + 1) * numberOfDocsEach,
        );
    });
});

before(async () => {
    const inserts = [Projects.insertMany(projects)];
    for (let key in db) {
        inserts.push(allCollections[key].insertMany(db[key]));
    }
    await Promise.all(inserts);
});

describe('## Export', async () => {
    describe('# GET /project/{projectId}/export', () => {
        it('Should retrieve a project backup', async () => {
            const res = await request(app)
                .get('/project/one/export?output=json');
            expect(res).to.include({ status: 200 });
            const expectedProject = { ...exportPayloads[0] }
            delete expectedProject.project.training;
            const { timestamp, bf_version, ...body } = res.body;
            expect(timestamp).to.exist;
            expect(bf_version).to.exist;
            expect(body).to.deep.equal(expectedProject);
        });
        it('Should retrieve a project backup without conversations and evaluations', async () => {
            const res = await request(app)
                .get('/project/one/export?output=json&conversations=false&evaluations=0');
            expect(res).to.include({ status: 200 });
            const { timestamp, bf_version, ...body } = res.body;
            const expectedProject = { ...exportPayloads[0] }
            delete expectedProject.project.training;
            const { evaluations, conversations, ...rest } = expectedProject;
            expect(timestamp).to.exist;
            expect(bf_version).to.exist;
            expect(body).to.deep.equal(rest);
        });
    });
});

describe('## Import', () => {
    describe('# PUT /project/{projectId}/import', () => {
        it('Should reject invalid project backups', done => {
            request(app)
                .put('/project/one/import')
                .send({})
                .expect(422)
                .then(() => done())
                .catch(done);
        });
        it('Should restore from a valid project backup', async () => {
            const res = await request(app)
                .put('/project/one/import') // into project 'one'
                .send(exportPayloads[1]) // import backup of project 'two'
            expect(res).to.include({ status: 200 })
            expect(res.text).to.be.equal('Success');

            const projectId = 'one'; // this one will stay
            const projectName = 'one'; // this one will stay
            let modelId = 'one'; // this one will change
            let storyGroupId = 'one'; // this one will change
            let checkpoints = ['one-a']; // this one will change

            const {
                _id: newProjectId,
                name: newProjectName,
                nlu_models: newNluModels,
                storyGroups: newStoryGroupOrder,
                ...newProject
            } = await Projects.findOne({ _id: projectId }, {}).lean();
            const {
                _id: exportFileProjectId,
                name: exportFileProjectName,
                nlu_models: exportFileNluModels,
                storyGroups: exportFileStoryGroupOrder,
                ...exportFileProject
            } = { ...exportPayloads[1].project };
            newProject.training = exportFileProject.training;
            const storyGroup = await allCollections.storyGroups
                .findOne({ _id: { $nin: [storyGroupId] }, name: 'two', projectId }, { _id: 1 })
                .lean();
            const exportFileStoryGroupId = exportPayloads[1].storyGroups[0]._id;
            const checkpoint = await allCollections.stories
                .findOne({ title: 'two-a', _id: { $ne: 'two-a' } })
                .lean();
            const exportFileCheckpoints = [
                exportPayloads[1].stories
                    .filter(s => !s.title !== checkpoints[0])
                    .stories,
            ];

            modelId = newNluModels[0]; // remember modelId
            storyGroupId = storyGroup._id; // remember storyGroupId
            checkpoints = [[checkpoint._id]];

            expect(newProjectId).to.be.equal(projectId); // project id didn't change
            expect(newProjectName).to.be.equal(projectName); // project name didn't change
            expect(newProject).to.be.deep.equal(exportFileProject); // everything else in project is as in backup
            expect(modelId).to.not.be.equal('one'); // modelId changed...
            expect(modelId).to.not.be.equal(exportFileNluModels[0]); // ...and yet is different from the one in backup
            expect(storyGroupId).to.not.be.equal('one'); // storyGroupId changed...
            expect(storyGroupId).to.not.be.equal(exportFileStoryGroupId); // ...and yet is different from the one in backup
            expect(checkpoints).to.not.be.deep.equal(['one-a']);
            expect(checkpoints).to.not.be.deep.equal(exportFileCheckpoints);

            for (let col in allCollections) {
                const fetched = await allCollections[col]
                    .findOne({ $or: [{ projectId }, { modelId }, { _id: modelId }, { checkpoints }] })
                    .lean();
                if (fetched) {
                    const {
                        projectId: docProjectId,
                        modelId: docModelId,
                        storyGroupId: docStoryGroupId,
                        checkpoints: docCheckpoints,
                        children: docChildren,
                        ...doc
                    } = fetched;
                    const {
                        projectId: exportFileProjectId,
                        modelId: exportFileModelId,
                        storyGroupId: exportFileStoryGroupId,
                        checkpoints: exportFileCheckpoints,
                        children: exportFileChildren,
                        ...exportFileDoc
                    } = { ...exportPayloads[1][col][0] };
    
                    expect(doc).to.exist; // able to find collection
    
                    if (col === 'models') expect(doc._id).to.be.equal(modelId); // modelId is as remembered
                    if (docModelId) expect(docModelId).to.be.equal(modelId); // modelId is as remembered
                    if (docProjectId) expect(docProjectId).to.be.equal(projectId); // projectId didn't change
                    if (docStoryGroupId) expect(docStoryGroupId).to.be.equal(storyGroupId); // storyGroupId is as remembered
                    if (docCheckpoints) expect(docCheckpoints).to.be.deep.equal(checkpoints);
    
                    delete doc._id;
                    delete exportFileDoc._id;
                    expect(JSON.parse(JSON.stringify(doc))).to.be.deep.equal(exportFileDoc); // everything else is as in backup
                }
            }
        });
    });
});
