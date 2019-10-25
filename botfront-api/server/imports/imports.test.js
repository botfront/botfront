const request = require("supertest-as-promised");
const httpStatus = require("http-status");
const chai = require("chai");
const expect = chai.expect;
const app = require("../../app");
chai.config.includeStack = true;
const fs = require("fs");
const {
  Projects,
  NLUModels,
  Conversations,
  Activity
} = require("../../models/models");

const conversationsToImport = JSON.parse(
  fs.readFileSync(__dirname + "/test_data/conversationsToImport.json", "utf8")
);

function dateParser(key, value) {
  if (key === "updatedAt" || key === "createdAt") {
    return new Date(value * 1000);
  }
  return value;
}
before(function(done) {
  console.log('5')
  const projectsFile = __dirname + "/test_data/projects.json";
  const modelsFile = __dirname + "/test_data/nluModels.json";
  const conversationFile = __dirname + "/test_data/conversations.json";
  const projects = JSON.parse(fs.readFileSync(projectsFile, "utf8"));
  const models = JSON.parse(fs.readFileSync(modelsFile, "utf8"));
  const conversation = JSON.parse(
    fs.readFileSync(conversationFile, "utf8"),
    dateParser
  );

  Projects.insertMany(projects)
    .then(() => NLUModels.insertMany(models))
    .then(() => Conversations.insertMany(conversation))
    .then(() => {
      done();
    });
});

describe("## last import", () => {
  describe("# GET /conversations/{projectId}/environment/{env}/latest-imported-event", () => {
    it("Should retrieve last import in production", done => {
      request(app)
        .get("/conversations/pro1/environment/production/latest-imported-event")
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.deep.equal({
            timestamp: 1550000000
          });
          done();
        })
        .catch(done);
    });

    it("Should give 0 as no import yet in staging", done => {
      request(app)
        .get("/conversations/pro1/environment/staging/latest-imported-event")
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.deep.equal({
            timestamp: 0
          });
          done();
        })
        .catch(done);
    });

    it("Should retrieve last import in development", done => {
      request(app)
        .get(
          "/conversations/pro1/environment/development/latest-imported-event"
        )
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.deep.equal({
            timestamp: 1450000000
          });
          done();
        })
        .catch(done);
    });

    it("Should return 400 when envirnonement does not exist", done => {
      request(app)
        .get(
          "/conversations/pro1/environment/prodduction/latest-imported-event"
        )
        .expect(httpStatus.UNPROCESSABLE_ENTITY)
        .then(res => {
          expect(res.body).to.deep.equal({
            "errors": [
                  {
                    location: 'params',
                    msg: 'environement should be one of: production, staging, development',
                    param: 'env',
                    value: 'prodduction',
                  }
                ]
          });
          done();
        })
        .catch(done);
    });
  });
});

describe("## import format checking", () => {
  describe("# POST /conversations/{projectId}/environment/{env}", () => {
    it("should fail with invalid body", done => {
      request(app)
        .post("/conversations/pro1/environment/production")
        .send({
          dummy: [{ name: "test", confidence: 0.99 }],
          text: "blabla"
        })
        .expect(httpStatus.UNPROCESSABLE_ENTITY)
        .then(res => {
          expect(res.body).to.deep.equal({
            errors: [
                  {
                    location: 'body',
                    msg: 'conversations should be an array',
                    param: 'conversations'
                  },
                  {
                    location: 'body',
                    msg: 'processNlu should be an boolean',
                    param: 'processNlu',
                  }
                ]
          });
          done();
        })
        .catch(done);
    });
    it("should fail with invalid conversations type", done => {
      request(app)
        .post("/conversations/pro1/environment/production")
        .send({
          conversations: "bad",
          processNlu: false
        })
        .expect(httpStatus.UNPROCESSABLE_ENTITY)
        .then(res => {
          expect(res.body).to.deep.equal({
            errors: [
                  {
                    location: 'body',
                    msg: 'conversations should be an array',
                    param: 'conversations',
                    value: 'bad',
                  }
                ]
          });
          done();
        })
        .catch(done);
    });
    it("should fail with invalid processNlu type", done => {
      request(app)
        .post("/conversations/pro1/environment/production")
        .send({
          conversations: [],
          processNlu: "fallse"
        })
        .expect(httpStatus.UNPROCESSABLE_ENTITY)
        .then(res => {
          expect(res.body).to.deep.equal({
            errors: [
                  {
                    location: 'body',
                    msg: 'processNlu should be an boolean',
                    param: 'processNlu',
                    value: 'fallse',
                  }
                ]
          });
          done();
        })
        .catch(done);
    });
    it("should import a new conversation and update and oldOne", done => {
      request(app)
        .post("/conversations/pro1/environment/production")
        .send({
          conversations: conversationsToImport.slice(0, 2),
          processNlu: true
        })
        .expect(httpStatus.OK)
        .then(async res => {
          expect(res.body).to.deep.equal({
            message: "successfuly imported all conversations"
          });
          Conversations.find({ _id: "new" })
            .lean()
            .exec()
            .then(newData => {
              expect(newData).to.have.length(1);
              expect(newData[0].projectId).to.equal("pro1");
              Conversations.find({ _id: "update" })
                .lean()
                .exec()
                .then(updateData => {
                  expect(updateData).to.have.length(1);
                  expect(updateData[0].projectId).to.equal("pro1");
                  expect(updateData[0].updatedAt).to.not.equal(
                    new Date(1550000000)
                  );
                  Activity.find({ text: "newevent" })
                    .lean()
                    .exec()
                    .then(activityData => {
                      expect(activityData).to.have.length(1);
                      done();
                    });
                });
            })
            .catch(done);
        });
    });

    it("should not import a conversation with a non undefined id", done => {
      request(app)
        .post("/conversations/pro1/environment/production")
        .send({
          conversations: conversationsToImport.slice(2, 3),
          processNlu: true
        })
        .expect(httpStatus.PARTIAL_CONTENT)
        .then(async res => {
          expect(res.body).to.deep.equal({
            messageConversation:
              "some conversation were not added, the field _id is missing",
            notValids: [conversationsToImport[2]]
          });
          Conversations.find({ _id: "projectnotexist" })
            .lean()
            .exec()
            .then(newData => {
              expect(newData).to.have.length(0);
              done();
            });
        })
        .catch(done);
    });
    it("should not import a parse data with unsupported language (no corresponding model)", done => {
      request(app)
        .post("/conversations/pro1/environment/production")
        .send({
          conversations: conversationsToImport.slice(3),
          processNlu: true
        })
        .expect(httpStatus.PARTIAL_CONTENT)
        .then(async res => {
          expect(res.body).to.deep.equal({
            messageParseData:
              "Some parseData have not been added to activity, the corresponding models could not be found",
            invalidParseDatas: [
              [conversationsToImport[3].tracker.events[0].parse_data]
            ]
          });
          Conversations.find({ _id: "projectnotexist" })
            .lean()
            .exec()
            .then(newData => {
              expect(newData).to.have.length(0);
              done();
            });
        })
        .catch(done);
    });
  });
});
