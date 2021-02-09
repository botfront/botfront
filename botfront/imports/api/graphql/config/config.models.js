import mongoose from 'mongoose';

const { Schema } = mongoose;

const credentials = new Schema({ _id: String }, { strict: false, versionKey: false });
const endpoints = new Schema({ _id: String }, { strict: false, versionKey: false });
const projects = new Schema({ _id: String }, { strict: false, versionKey: false });

exports.Endpoints = mongoose.model('Endpoints', endpoints, 'endpoints');
exports.Credentials = mongoose.model('Credentials', credentials, 'credentials');
exports.Projects = mongoose.model('Projects', projects, 'projects');
