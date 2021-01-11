import JSZip from 'jszip';
import { basename } from 'path';
import { determineDataType } from '../../../lib/importers/common';
import { StoryGroups } from '../../storyGroups/storyGroups.collection';
import { Projects } from '../../project/project.collection';
import {
    validateEndpoints,
    validateCredentials,
    validateIncoming,
    validateConversations,
    validateBfConfig,
    validateAnalyticsConfig,
    validateWidgetSettings,
    validateFormsResults,
} from '../../../lib/importers/validateMisc.js';
import { validateRasaConfig } from '../../../lib/importers/validateRasaConfig.js';
import {
    validateDomain,
    validateDefaultDomains,
} from '../../../lib/importers/validateDomain.js';
import { validateTestCases } from '../../../lib/importers/validateTestCases';
import { validateTrainingData } from '../../../lib/importers/validateTrainingData.js';
import { handleImportAll } from './fileImporters';

function streamToBuffer(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

// extract the raw text from the files and infer types
// if there is a bfconfig file, it processes it, because we need the data
// from that file for the validation later
// (eg: the default domain, the project languages)
export async function getRawTextAndType(files) {
    const filesDataAndTypes = await Promise.all(
        files.map(async (file) => {
            if (file?.errors?.length) return file;
            const { filename } = file;
            // files unzipped on the server already have rawText
            const rawText = file.rawText
                || (await streamToBuffer(file.createReadStream())).toString('utf8');
            if (/\ufffd/.test(rawText)) {
                // out of range char test
                return {
                    file,
                    filename,
                    errors: [{ text: 'File is not parseable text.' }],
                };
            }
            const dataType = determineDataType(file, rawText);
            if (['unknown', 'empty'].includes(dataType)) {
                const text = dataType === 'unknown' ? 'Unknown file type' : 'Empty file';
                return {
                    file,
                    filename,
                    rawText,
                    errors: [{ text }],
                    dataType,
                };
            }
            return {
                file,
                filename,
                rawText,
                dataType,
            };
        }),
    );

    return filesDataAndTypes;
}

const createTimestamp = () => (
    new Date()
        .toISOString()
        .replace('T', ' ')
        .replace('Z', '')
);

export async function validateFiles(files, params) {
    let filesWithMessages = files;
    let newParams = { ...params, timestamp: createTimestamp() };
    // this is the validation pipeline each step only add errors to the files it should validate
    // each step can also add data to the params, eg : the default domain, the summary of changes etc,
    [filesWithMessages, newParams] = validateDefaultDomains(filesWithMessages, newParams);
    [filesWithMessages, newParams] = validateRasaConfig(filesWithMessages, newParams);
    [filesWithMessages, newParams] = validateBfConfig(filesWithMessages, newParams);
    [filesWithMessages, newParams] = await validateTrainingData(
        filesWithMessages,
        newParams,
    );
    [filesWithMessages, newParams] = validateTestCases(filesWithMessages, newParams);
    [filesWithMessages, newParams] = validateEndpoints(filesWithMessages, newParams);
    [filesWithMessages, newParams] = validateCredentials(filesWithMessages, newParams);
    [filesWithMessages, newParams] = validateDomain(filesWithMessages, newParams);
    [filesWithMessages, newParams] = validateConversations(filesWithMessages, newParams);
    [filesWithMessages, newParams] = validateIncoming(filesWithMessages, newParams);
    [filesWithMessages, newParams] = validateAnalyticsConfig(filesWithMessages, newParams);
    [filesWithMessages, newParams] = validateWidgetSettings(filesWithMessages, newParams);
    [filesWithMessages, newParams] = validateFormsResults(filesWithMessages, newParams);


    return [filesWithMessages, newParams];
}

export async function readAndValidate(files, params) {
    // get raw text and type from every file,
    const filesDataAndTypes = await getRawTextAndType(files, params);

    // send all files to the validation pipeline
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

const unzipFiles = files => files.reduce(async (acc, file) => {
    let filesInFile = [file];
    if (file.filename.match(/\.zip$/)) {
        try {
            const loadedZip = await JSZip.loadAsync(
                await streamToBuffer(file.createReadStream()),
            );
            filesInFile = await Object.entries(loadedZip.files).reduce(
                async (acc2, [path, item]) => {
                    if (item.dir) return acc2;
                    const rawText = await item.async('text');
                    if (!rawText) return acc2;
                    const filename = basename(path);
                    return [...(await acc2), { filename, rawText }];
                },
                [],
            );
        } catch {
            filesInFile = [{ ...file, errors: [{ text: 'Could not unzip file.' }] }];
        }
    }
    return [...(await acc), ...filesInFile];
}, []);

// this function validates then import the files if there are no errors
// onlyValidate are boolean switches to alter the steps of the validation
export async function importSteps({
    projectId,
    files,
    onlyValidate,
    ignoreFilesWithErrors = false,
    wipeInvolvedCollections,
    wipeProject,
    fallbackLang: providedFallbackLanguage,
}) {
    let existingStoryGroups;
    if (wipeProject) {
        existingStoryGroups = [];
    } else {
        existingStoryGroups = StoryGroups.find(
            { projectId },
            { fields: { name: 1, _id: 1 } },
        ).fetch();
    }
    const {
        languages: projectLanguages,
        defaultLanguage,
        deploymentEnvironments,
    } = Projects.findOne(
        { _id: projectId },
        { fields: { languages: 1, defaultLanguage: 1, deploymentEnvironments: 1 } },
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
        projectLanguages: wipeProject ? [fallbackLang] : projectLanguages,
        supportedEnvs: ['development', ...(deploymentEnvironments || [])],
        summary: wipeProject ? [{ text: 'ALL PROJECT DATA WILL BE ERASED.' }] : [],
    };
    const filesAndValidationData = await readAndValidate(await unzipFiles(files), params);
    if (onlyValidate) return filesAndValidationData;
    if (!ignoreFilesWithErrors && filesAndValidationData.fileMessages.some(f => f?.errors?.length)) {
        return filesAndValidationData;
    }
    const { fileMessages: filesToImport, params: newParams } = filesAndValidationData;
    const importResult = await handleImportAll(filesToImport, newParams);
    return { summary: importResult.map(text => ({ text })) };
}
