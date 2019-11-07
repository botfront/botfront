/* eslint-disable no-unused-vars */
import {
    getActivities,
} from '../mongo/activity';

export default {
    Query: {
        async  activities(_, args, __) {
            return getActivities(args.modelId);
        },
    },
    Mutation: {
       
    },
    Activity: {
        _id: (parent, _, __) => parent._id,
        modelId: (parent, _, __) => parent.modelId,
        text: (parent, _, __) => parent.text,
        intent: (parent, _, __) => parent.intent,
        entities: (parent, _, __) => parent.entities,
        confidence: (parent, _, __) => parent.confidence,
        validated: (parent, _, __) => parent.validated,
        warning: (parent, _, __) => parent.warning,
        createdAt: (parent, _, __) => parent.createdAt,
        updatedAt: (parent, _, __) => parent.updatedAt,
    },
  
    Entity: {
        start: (parent, _, __) => parent.start,
        end: (parent, _, __) => parent.end,
        value: (parent, _, __) => parent.value,
        entity: (parent, _, __) => parent.entity,
        confidence: (parent, _, __) => parent.confidence,
        extractor: (parent, _, __) => parent.extractor,
        processors: (parent, _, __) => parent.processors,
    },
  
    Warning: {
        title: (parent, _, __) => parent.title,
        description: (parent, _, __) => parent.description,
    },
};
