import mongoose from 'mongoose';

const { Schema } = mongoose;
const conversation = new Schema({ _id: String }, { strict: false });

module.exports = mongoose.model('Conversation', conversation, 'conversations');
