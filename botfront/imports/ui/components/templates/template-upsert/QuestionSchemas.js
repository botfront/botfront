import SimpleSchema from "simpl-schema";

export const ImageSchema = new SimpleSchema({
    "text": String,
    "image": String
}, {tracker: Tracker});

export const QuickRepliesSchema = new SimpleSchema({
    "text": String,
    "buttons": {type: Array, maxCount:10, minCount:1},
    "buttons.$": Object,
    "buttons.$.title": String,
    "buttons.$.payload": String
}, {tracker: Tracker});

export const TextSchema = new SimpleSchema({
    "text": String,
}, {tracker: Tracker});

export const CarouselSchema = new SimpleSchema({
    "text": {type: String, optional: true},
    "elements": {type: Array, maxCount:10, minCount:1},
    "elements.$": Object,
    "elements.$.title": String,
    "elements.$.buttons": {type:Array, minCount: 1, maxCount: 3},
    "elements.$.buttons.$": Object,
    "elements.$.buttons.$.title": String,
    "elements.$.buttons.$.payload": {type: String, required: false},
    "elements.$.buttons.$.url": {type: String, required: false}
}, {tracker: Tracker});