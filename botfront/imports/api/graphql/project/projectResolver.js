import {
    importSteps,
} from './import.utils';
import { checkIfCan } from '../../../lib/scopes';

export default {
    Mutation: {
        async import(_, args, context) {
            const {
                files, noValidate, onlyValidate, projectId, wipeCurrent, fallbackLang,
            } = args;
            checkIfCan('projects:w', projectId, context.user._id);
            // files is a list of promises as the files gets uploaded to the server
            const filesData = await Promise.all(files);
            return importSteps(projectId, filesData, onlyValidate, noValidate, wipeCurrent, fallbackLang);
        },
    },
    Report: {
        fileMessages: parent => parent.fileMessages,
        summary: parent => parent.summary,
    },

    fileMessages: {
        errors: parent => parent.errors,
        warnings: parent => parent.warnings,
        info: parent => parent.info,
        filename: parent => parent.filename,
        conflicts: parent => parent.conflicts,
    },
};
