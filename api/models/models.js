const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');
const { ObjectId } = mongoose.Types;
const { languages } = require('./languages')

const entity = new Schema(
    {
        start: { type: Number, required: true },
        end: { type: Number, required: true },
        value: { type: String, required: true },
        entity: { type: String, required: true },
        confidence: { type: Number, required: false },
        extractor: { type: String, required: false },
        processors: [{ type: String, required: false }],
    },
    { _id: false, versionKey: false },
);

const projects = new Schema({ _id: String }, { strict: false, versionKey: false });

const responses = new Schema({
    _id:
        {
            type: String,
            default: () => String(new ObjectId()),
        },
    key: {
        type: String,
        label: 'Template Key',
        match: /^(utter_)/,
    },
    projectId: String,
    values: {
        type: [
            {
                _id: false,
                lang: { type: String, enum: Object.keys(languages) },
                sequence: [{ _id: false, content: { type: String } }],
            },
        ],
        max: 5,
        min: 0,
    },
    textIndex: String,
    metadata: {
        default: undefined,
        type: {
            linkTarget: String,
            userInput: String,
            forceOpen: Boolean,
            forceClose: Boolean,
            domHighlight:{
                style:String,
                selector:String,
            },
            customCss:{
                style:String,
                css:String,
            },
            pageChangeCallbacks:{
                pageChanges: {
                    type: [
                        {
                            regex: Boolean,
                            url:String,
                            callbackIntent:String,
                        },
                    ],
                },
                errorIntent:String,
            },
            pageEventCallbacks:{
                pageEvents:{
                    type: [
                        {
                            event: String,
                            selector:String,
                            payload:String,
                        },
                    ],
                },
            }},
    },
}, {versionKey: false });

responses.index({ key: 1, projectId: 1 }, { unique: true });
const credentials = new Schema({ _id: String }, { strict: false, versionKey: false });
const endpoints = new Schema({ _id: String }, { strict: false, versionKey: false });
const nlu_models = new Schema({ _id: String }, { strict: false, versionKey: false });
const evaluations = new Schema({ _id: String }, { strict: false, versionKey: false });
const story_groups = new Schema({ _id: String }, { strict: false, versionKey: false });
const stories = new Schema({ _id: String }, { strict: false, versionKey: false });
const slots = new Schema({ _id: String }, { strict: false, versionKey: false });
const forms = new Schema({ _id: String }, { strict: false, versionKey: false });
const instances = new Schema({ _id: String }, { strict: false, versionKey: false });
const core_policies = new Schema({ _id: String }, { strict: false, versionKey: false });
const conversations = new Schema({ _id: String }, { strict: false, versionKey: false });
const form_results = new Schema({ _id: String }, { strict: false, versionKey: false });
const analytics_dashboards = new Schema({ _id: String }, { strict: false, versionKey: false });
const activity = new Schema({
    _id: { type: String, default: shortid.generate },
}, { strict: false, versionKey: false });
const examples = new Schema({ _id: String }, { strict: false, versionKey: false });

exports.Examples = mongoose.model('Examples', examples, 'examples');
exports.Activity = mongoose.model('Activity', activity, 'activity');
exports.AnalyticsDashboards = mongoose.model('AnalyticsDashboards', analytics_dashboards, 'analyticsDashboards');
exports.Conversations = mongoose.model('Conversations', conversations, 'conversations');
exports.FormResults = mongoose.model('FormResults', form_results, 'form_results');
exports.CorePolicies = mongoose.model('CorePolicies', core_policies, 'core_policies');
exports.Instances = mongoose.model('Instances', instances, 'nlu_instances');
exports.Slots = mongoose.model('Slots', slots, 'slots');
exports.Forms = mongoose.model('Forms', forms, 'forms');
exports.Stories = mongoose.model('Stories', stories, 'stories');
exports.StoryGroups = mongoose.model('StoryGroups', story_groups, 'storyGroups');
exports.Evaluations = mongoose.model('Evaluations', evaluations, 'nlu_evaluations');
exports.NLUModels = mongoose.model('NLUModels', nlu_models, 'nlu_models');
exports.Endpoints = mongoose.model('Endpoints', endpoints, 'endpoints');
exports.Credentials = mongoose.model('Credentials', credentials, 'credentials');
exports.Projects = mongoose.model('Projects', projects, 'projects');
exports.Responses = mongoose.model('Responses', responses, 'botResponses');
