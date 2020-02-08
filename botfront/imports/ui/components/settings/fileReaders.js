import { useReducer } from 'react';
import {
    fileToStoryGroup,
    parseStoryGroups,
    generateStories,
} from '../../../lib/importers/loadStories';
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
    defaultDomain,
    fallbackImportLanguage,
    projectLanguages,
}) => {
    const reducer = (fileList, instruction) => {
        // eslint-disable-next-line no-use-before-define
        const setFileList = ins => domainFileReader[1](ins);
        const {
            delete: deleteInstruction,
            add: addInstruction,
            update: updateInstruction,
        } = instruction;

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
                    return update(setFileList, f, loadDomain({
                        rawText: reader.result,
                        defaultDomain,
                        fallbackImportLanguage,
                        projectLanguages,
                    }));
                };
            });
            return [...fileList, ...addInstruction.map(f => base(f))];
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
