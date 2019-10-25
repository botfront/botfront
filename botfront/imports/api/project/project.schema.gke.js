import { ProjectsSchema as BaseProjectsSchema } from './project.schema.default';

export const ProjectsSchema = BaseProjectsSchema.extend({
    apiKey: { type: String, optional: true },
    namespace: {
        type: String,
        unique: 1,
        sparse: 1,
        custom() {
            return !this.value.match(/^bf-[a-zA-Z0-9-]+$/) ? 'invalidNamespace' : null;
        },
    },
});

ProjectsSchema.messageBox.messages({
    en: {
        invalidNamespace: 'The namespace must starts with \'bf-\' and can only contain letters, numbers and dashes (\'-\')',
    },
});
