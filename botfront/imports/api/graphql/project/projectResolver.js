import {
    importSteps,
} from './import.utils';
import { checkIfCan } from '../../../lib/scopes';

export default {
    Mutation: {
        async import(_, args, context) {
            const {
                files, onlyValidate, projectId, wipeInvolvedCollections, fallbackLang, wipeProject,
            } = args;
            checkIfCan('projects:w', projectId, context.user._id);
            // files is a list of promises as the files gets uploaded to the server
            const filesData = await Promise.all(files);
            return importSteps({
                projectId, files: filesData, onlyValidate, fallbackLang, wipeInvolvedCollections, wipeProject,
            });
        },
    },
    ImportReport: {
        fileMessages: parent => parent.fileMessages,
        summary: parent => parent.summary,
    },
    ImportSummaryEntry: {
        text: parent => parent.text,
        longText: parent => parent.longText,
    },
    FileMessage: {
        errors: parent => parent.errors,
        warnings: parent => parent.warnings,
        info: parent => parent.info,
        filename: parent => parent.filename,
        conflicts: parent => parent.conflicts,
    },
};
