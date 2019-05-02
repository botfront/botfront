import { ProjectsSchema as BaseProjectsSchema } from './project.schema.default';

export const ProjectsSchema = BaseProjectsSchema.extend({
    apiKey: { type: String, optional: true },
    namespace: {
        type: String, regEx: /^[a-z0-9-_]+$/, unique: 1, sparse: 1,
    },
});
