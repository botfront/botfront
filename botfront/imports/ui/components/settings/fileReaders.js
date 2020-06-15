import { useReducer } from 'react';
import {
    fileToStoryGroup,
    parseStoryGroups,
    generateStories,
} from '../../../lib/importers/loadStories';
import { languages } from '../../../lib/languages';
import { loadDomain } from '../../../lib/importers/loadDomain';

const validateStories = (storyFiles) => {
    const stories = storyFiles
        .filter(f => !(f.errors || []).length && f.stories)
        .map(sg => sg.stories)
        .reduce((acc, curr) => [...acc, ...curr], []);
    const { stories: parsedStories, warnings } = generateStories(stories);
    return storyFiles.map(sf => ({
        ...sf,
        parsedStories: parsedStories.filter(
            ({ storyGroupId }) => storyGroupId === sf._id,
        ),
        warnings: warnings
            .filter(({ storyGroupId }) => storyGroupId === sf._id)
            .map(w => w.message),
    }));
};

const base = f => ({ filename: f.name, name: f.name, lastModified: f.lastModified });
const update = (updater, file, content) => updater({
    update: {
        ...base(file),
        ...content,
    },
});
const findFileInFileList = (fileList, file) => fileList.findIndex(
    cf => cf.filename === file.filename
            && cf.lastModified === file.lastModified,
);
const updateAtIndex = (fileList, index, content) => [
    ...fileList.slice(0, index),
    { ...fileList[index], ...content },
    ...fileList.slice(index + 1),
];
const deleteAtIndex = (fileList, index) => [
    ...fileList.slice(0, index),
    ...fileList.slice(index + 1),
];

/* file readers must implement 'delete' and 'add' instructions */

export const useStoryFileReader = (existingStoryGroups) => {
    const reducer = (fileList, instruction) => {
        // eslint-disable-next-line no-use-before-define
        const setFileList = ins => storyFileReader[1](ins);
        const {
            delete: deleteInstruction,
            add: addInstruction,
            update: updateInstruction,
        } = instruction;

        if (deleteInstruction) {
            const index = findFileInFileList(fileList, deleteInstruction);
            if (index < 0) return fileList;
            return validateStories(deleteAtIndex(fileList, index));
        }
        if (addInstruction) {
            // add: array of files
            if (addInstruction.some(f => f.firstLine)) {
                // file already there, but data wiping toggled, so just need to change storygroup name
                return fileList.map((f) => {
                    if (!f.firstLine) return f;
                    const { name } = fileToStoryGroup(f.filename, f.firstLine, [
                        ...existingStoryGroups,
                    ]);
                    return { ...f, name };
                });
            }
            addInstruction.forEach((f) => {
                const reader = new FileReader();
                reader.readAsText(f);
                reader.onload = () => {
                    if (/\ufffd/.test(reader.result)) { // out of range char test
                        return update(setFileList, f, { errors: ['file is not parseable text'] });
                    }
                    const storyGroupParse = fileToStoryGroup(f.name, reader.result, [
                        ...existingStoryGroups,
                        ...fileList,
                    ]);
                    if (!storyGroupParse) {
                        return update(setFileList, f, { errors: ['could not read story file'] });
                    }
                    const stories = parseStoryGroups([storyGroupParse]);
                    const errors = stories
                        .filter(s => 'error' in s)
                        .map(s => s.error.message);
                    if (!stories.length) errors.push('No stories found in file.');
                    // if (stories.length > 30) errors.unshift('File contains over 30 stories. Consider splitting in smaller chunks.');
                    if (errors.length) {
                        return update(setFileList, f, { errors });
                    }
                    return update(setFileList, f, { ...storyGroupParse, stories });
                };
            });
            return [...fileList, ...addInstruction.map(f => base(f))];
        }
        if (updateInstruction) {
            // callback for 'add' method
            const index = findFileInFileList(fileList, updateInstruction);
            if (index < 0) return fileList;
            if (
                fileList.some(
                    (f, idx) => f.name === updateInstruction.name && index !== idx,
                )
            ) {
                updateInstruction.errors = [
                    ...(updateInstruction.errors || []),
                    'Another file was uploaded with same name.',
                ];
            }
            return validateStories(updateAtIndex(fileList, index, updateInstruction));
        }
        return fileList;
    };
    const storyFileReader = useReducer(reducer, []);
    return storyFileReader;
};

export const useDomainFileReader = ({
    defaultDomain, fallbackImportLanguage, projectLanguages,
}) => {
    const reducer = (fileList, instruction) => {
        // eslint-disable-next-line no-use-before-define
        const setFileList = ins => domainFileReader[1](ins);
        const {
            delete: deleteInstruction,
            add: addInstruction,
            update: updateInstruction,
            changeLang: changeLangInstruction,
        } = instruction;

        const doLoadDomain = (rawText, newFallbackImportlanguage) => loadDomain({
            rawText,
            defaultDomain,
            fallbackImportLanguage: newFallbackImportlanguage || fallbackImportLanguage,
            projectLanguages,
        });

        if (deleteInstruction) {
            const index = findFileInFileList(fileList, deleteInstruction);
            if (index < 0) return fileList;
            return deleteAtIndex(fileList, index);
        }
        if (addInstruction) {
            // add: array of files
            addInstruction.forEach((f) => {
                const reader = new FileReader();
                reader.readAsText(f);
                reader.onload = () => {
                    if (/\ufffd/.test(reader.result)) { // out of range char test
                        return update(setFileList, f, { errors: ['file is not parseable text'] });
                    }
                    return update(setFileList, f, doLoadDomain(reader.result));
                };
            });
            return [...fileList, ...addInstruction.map(f => base(f))];
        }
        if (changeLangInstruction) {
            return fileList.map(f => ({ ...f, ...doLoadDomain(f.rawText, changeLangInstruction) }));
        }
        if (updateInstruction) {
            // callback for 'add' method
            const index = findFileInFileList(fileList, updateInstruction);
            if (index < 0) return fileList;
            return updateAtIndex(fileList, index, updateInstruction);
        }
        return fileList;
    };
    const domainFileReader = useReducer(reducer, []);
    return domainFileReader;
};

export const useDatasetFileReader = ({
    instanceHost, fallbackImportLanguage, projectLanguages, projectId,
}) => {
    const reducer = (fileList, instruction) => {
        // eslint-disable-next-line no-use-before-define
        const setFileList = ins => datasetFileReader[1](ins);
        const {
            delete: deleteInstruction,
            add: addInstruction,
            update: updateInstruction,
            changeLang: changeLangInstruction,
        } = instruction;

        const getLanguage = (rawText, newFallbackImportLanguage) => {
            const languageFromFirstLine = (
                rawText
                    .split('\n', 1)[0]
                    .match(/^#[^#]lang:(.*)/)
                || [])[1];
            return Object.keys(languages).includes(languageFromFirstLine)
                ? languageFromFirstLine
                : (newFallbackImportLanguage || fallbackImportLanguage);
        };
        const getCanonical = (rawText) => {
            const start = rawText.split('# canonical')[1] || '';
            const canonicalAndEnd = start.split('\n\n');
            const canonical = canonicalAndEnd.length > 1 ? canonicalAndEnd[0] : '';
            return canonical.split('\n- ');
        };
        if (deleteInstruction) {
            const index = findFileInFileList(fileList, deleteInstruction);
            if (index < 0) return fileList;
            return deleteAtIndex(fileList, index);
        }
        if (addInstruction) {
            // add: array of files
            addInstruction.forEach((f) => {
                const reader = new FileReader();
                reader.readAsText(f);
                reader.onload = () => {
                    if (/\ufffd/.test(reader.result)) { // out of range char test
                        return update(setFileList, f, { errors: ['file is not parseable text'] });
                    }
                    const language = getLanguage(reader.result);
                    if (!projectLanguages.includes(language)) {
                        return update(setFileList, f, { errors: [`Dataset detected for language ${language}, but no such language used by project.`] });
                    }
                    const canonical = getCanonical(reader.result);
                    
                    Meteor.call('rasa.convertToJson', reader.result, language, 'json', instanceHost, projectId, (err, res) => {
                        if (err || !res.data || !res.data.rasa_nlu_data) {
                            return update(setFileList, f, { errors: [`File could not be parsed by Rasa at ${instanceHost}.`] });
                        }
                        const { rasa_nlu_data: data } = res.data;
                        // to do: non-lossy format for metadata e.g. canonical status
                        delete data.lookup_tables; // to do: gazette from look up tables,
                        // caveat: conversion route can't be used since tables are found in external text files
                        delete data.regex_features; // to do: regex features
                        return update(setFileList, f, { language, rasa_nlu_data: data, canonical });
                    });
                    return update(setFileList, f, { language, rawText: reader.result, canonical });
                };
            });
            return [...fileList, ...addInstruction.map(f => base(f))];
        }
        if (changeLangInstruction) {
            return fileList.map(f => ({ ...f, language: getLanguage(f.rawText, changeLangInstruction) }));
        }
        if (updateInstruction) {
            // callback for 'add' method
            const index = findFileInFileList(fileList, updateInstruction);
            if (index < 0) return fileList;
            return updateAtIndex(fileList, index, updateInstruction);
        }
        return fileList;
    };
    const datasetFileReader = useReducer(reducer, []);
    return datasetFileReader;
};
