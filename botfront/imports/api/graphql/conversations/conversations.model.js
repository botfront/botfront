import mongoose from 'mongoose';

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

const model = new Schema(
    {
        _id: {
            type: String,
            default: () => String(new ObjectId()),
        },
        userId: String,
    }, { strict: false },
);

module.exports = mongoose.model('Conversation', model, 'conversations');
