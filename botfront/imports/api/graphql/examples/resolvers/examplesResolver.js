/* eslint-disable no-unused-vars */
import {
    getExamples,
    listIntents,
    listEntities,
    insertExamples,
    updateExample,
    deleteExamples,
} from '../mongo/examples.js';


export default {
    Query: {
        async examples(_, args, __) {
            return getExamples(...args);
        },
        async listIntents(_, args, __) {
            return listIntents(...args);
        },
        async listEntities(_, args, __) {
            return listEntities(...args);
        },

    },
    Mutation: {
        async updateExample(_, args, __) {
            const response = await updateExample(...args);
            return { success: response.ok === 1 };
        },
        async insertExamples(_, args, __) {
            const response = await insertExamples(...args);
            return { success: response.ok === 1 };
        },
        async deleteExamples(_, args, __) {
            const response = await deleteExamples(...args);
            return { success: response.ok === 1 };
        },
    },


    ExamplePage: {
        examples: (parent, _, __) => parent.examples,
        pageInfo: (parent, _, __) => parent.pageInfo,
    },

    Example: {
        projectId: (parent, _, __) => parent.projectId,
        status: (parent, _, __) => parent.status,
        id: (parent, _, __) => parent._id,
        language: (parent, _, __) => parent.language,
        text: (parent, _, __) => parent.text,
        intent: (parent, _, __) => parent.intent,
        entities: (parent, _, __) => parent.entities,
        metadata: (parent, _, __) => parent.metadata,
    },
};
