import { getWebchatProps } from './webchatProps';

export default {
    Query: {
        getWebchatProps: async (__root, args) => {
            const { projectId } = args;
            if (!projectId) throw new Error('ProjectId missing!');
            return getWebchatProps(projectId);
        },
    },
};
