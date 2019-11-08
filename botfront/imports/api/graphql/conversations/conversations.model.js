import mongoose from 'mongoose';

const { Schema } = mongoose;
const model = new Schema({ _id: String }, { strict: false });

module.exports = mongoose.model('Conversation', model, 'conversations');
