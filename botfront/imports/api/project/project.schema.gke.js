import { ProjectsSchema as BaseProjectsSchema } from './project.schema.default';

export const ProjectsSchema = BaseProjectsSchema.extend({
    namespace: {
        type: String,
        unique: 1,
        sparse: 1,
        custom() {
            return !this.value.match(/^bf-[a-zA-Z0-9-]+$/) ? 'invalidNamespace' : null;
        },
    },
    modelsBucket: { type: String, regEx: /^[a-z0-9-_]+$/, optional: true },
    allowContextualQuestions: { type: Boolean, defaultValue: false },
});

ProjectsSchema.messageBox.messages({
    en: {
        invalidNamespace: 'The namespace must starts with \'bf-\' and can only contain letters, numbers and dashes (\'-\')',
    },
});
