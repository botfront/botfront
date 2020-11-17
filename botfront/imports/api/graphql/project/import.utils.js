import { determineDataType } from '../../../lib/importers/common';
import { StoryGroups } from '../../storyGroups/storyGroups.collection';
import { Projects } from '../../project/project.collection';
import {
    validateEndpoints,
    validateCredentials,
    validateIncoming,
    validateConversations,
    validateBfConfig,
} from '../../../lib/importers/validateMisc.js';
import { validateRasaConfig } from '../../../lib/importers/validateRasaConfig.js';
import {
    validateDomain,
    validateDefaultDomains,
} from '../../../lib/importers/validateDomain.js';
import { validateTrainingData } from '../../../lib/importers/validateTrainingData.js';
import { handleImportAll } from './fileImporters';

function streamToString(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}

// extract the raw text from the files and infer types
// if there is a bfconfig file it process it, because we need the data from that file for the validation later
// (eg: the default domain, the project languages)
export async function getRawTextAndType(files) {
    const filesDataAndTypes = await Promise.all(
        files.map(async (file) => {
            const { filename } = file;
            const rawText = await streamToString(file.createReadStream());
            if (/\ufffd/.test(rawText)) {
                // out of range char test
                return {
                    file,
                    filename,
                    errors: [{ text: 'File is not parseable text.' }],
                };
            }
            return {
                file,
                filename,
                rawText,
                dataType: determineDataType(file, rawText),
            };
        }),
    );

    return filesDataAndTypes;
}

export async function validateFiles(files, params) {
    let filesWithMessages = files;
    let newParams = { ...params, summary: [] };
    // this is the validation pipeline each step only add errors to the files it should validate
    // each step can also add data to the params, eg : the default domain, the summary of changes etc,
    [filesWithMessages, newParams] = validateDefaultDomains(filesWithMessages, newParams);
    [filesWithMessages, newParams] = validateRasaConfig(filesWithMessages, newParams);
    [filesWithMessages, newParams] = validateBfConfig(filesWithMessages, newParams);
    [filesWithMessages, newParams] = validateEndpoints(filesWithMessages, newParams);
    [filesWithMessages, newParams] = validateCredentials(filesWithMessages, newParams);
    [filesWithMessages, newParams] = validateDomain(filesWithMessages, newParams);
    [filesWithMessages, newParams] = validateConversations(filesWithMessages, newParams);
    [filesWithMessages, newParams] = validateIncoming(filesWithMessages, newParams);
    [filesWithMessages, newParams] = await validateTrainingData(
        filesWithMessages,
        newParams,
    );

    return [filesWithMessages, newParams];
}

export async function readAndValidate(files, params) {
    // get raw text and type from every file,
    const filesDataAndTypes = await getRawTextAndType(files, params);

    // send all file to the validation pipeline
    const [
        mixedFileMessages,
        { summary: mixedSummary, ...finalParams },
    ] = await validateFiles(filesDataAndTypes, params);
    const summary = mixedSummary.map(s => (typeof s === 'string' ? { text: s } : s));
    const fileMessages = mixedFileMessages.map(
        ({
            warnings = [], errors = [], info = [], ...f
        }) => ({
            ...f,
            warnings: warnings.map(s => (typeof s === 'string' ? { text: s } : s)),
            errors: errors.map(s => (typeof s === 'string' ? { text: s } : s)),
            info: info.map(s => (typeof s === 'string' ? { text: s } : s)),
        }),
    );
    return {
        fileMessages,
        summary,
        params: finalParams,
    };
}

export function hasErrors(messages) {
    let containsErrors = false;
    messages.forEach((message) => {
        if (message.errors && message.errors.length > 0) containsErrors = true;
    });
    return containsErrors;
}

// this function validate then import the files if there is not errors
// onlyValidate are boolean switches to alter the steps of the validation
export async function importSteps({
    projectId,
    files,
    onlyValidate,
    wipeInvolvedCollections,
    wipeProject,
    fallbackLang: providedFallbackLanguage,
}) {
    const existingStoryGroups = StoryGroups.find(
        { projectId },
        { fields: { name: 1, _id: 1 } },
    ).fetch();
    const { languages: projectLanguages, defaultLanguage } = Projects.findOne(
        { _id: projectId },
        { fields: { languages: 1, defaultLanguage: 1 } },
    );
    const fallbackLang = projectLanguages.includes(providedFallbackLanguage)
        ? providedFallbackLanguage
        : defaultLanguage;

    const params = {
        onlyValidate,
        projectId,
        existingStoryGroups,
        wipeInvolvedCollections,
        fallbackLang,
        wipeProject,
        projectLanguages,
    };
    const filesAndValidationData = await readAndValidate(files, params);

    if (onlyValidate || hasErrors(filesAndValidationData.fileMessages)) {
        return filesAndValidationData;
    }
    const { fileMessages: filesToImport, params: newParams } = filesAndValidationData;
    const importResult = await handleImportAll(filesToImport, newParams);
    return { summary: importResult.map(text => ({ text })) };
}
