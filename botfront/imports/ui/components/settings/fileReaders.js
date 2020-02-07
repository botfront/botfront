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
            .map(w => w.message)
            .concat(
                sf.errors || (sf.stories && sf.stories.length) ? [] : ['No stories found in file.'],
            ),
    }));
};

/* file readers must implement 'delete' and 'add' instructions */

export const useStoryFileReader = (existingStoryGroups) => {
    const reducer = (fileList, instruction) => {
        // eslint-disable-next-line no-use-before-define
        const setFileList = ins => storyFileReader[1](ins);
        const { delete: deleteInstruction, add: addInstruction, update: updateInstruction } = instruction;

        if (deleteInstruction) {
            const file = fileList.findIndex(
                cf => cf.filename === deleteInstruction.filename
                    && cf.lastModified === deleteInstruction.lastModified,
            );
            return validateStories([
                ...fileList.slice(0, file),
                ...fileList.slice(file + 1),
            ]);
        }
        if (addInstruction) {
            // add: array of files
            const base = f => ({ filename: f.name, lastModified: f.lastModified });
            const newFileList = [
                ...fileList,
                ...addInstruction.map(f => ({
                    ...base(f), name: f.name,
                })),
            ];
            addInstruction.forEach((f) => {
                const reader = new FileReader();
                reader.readAsText(f);
                reader.onload = () => {
                    if (/\ufffd/.test(reader.result)) {
                        // out of range char test
                        return setFileList({
                            update: {
                                ...base(f),
                                errors: ['file is not parseable text'],
                            },
                        });
                    }
                    const storyGroupParse = fileToStoryGroup(
                        f.name,
                        reader.result,
                        [...existingStoryGroups, ...fileList],
                    );
                    if (!storyGroupParse) {
                        return setFileList({
                            update: {
                                ...base(f),
                                errors: ['could not read story file'],
                            },
                        });
                    }
                    const stories = parseStoryGroups([storyGroupParse]);
                    const errors = stories
                        .filter(s => 'error' in s)
                        .map(s => s.error.message);
                    if (errors.length) {
                        return setFileList({
                            update: { ...base(f), errors },
                        });
                    }
                    return setFileList({
                        update: { ...base(f), ...storyGroupParse, stories },
                    });
                };
            });
            return newFileList;
        }
        if (updateInstruction) {
            // callback for 'add' method
            const previous = fileList.findIndex(
                cf => cf.filename === updateInstruction.filename
                    && cf.lastModified === updateInstruction.lastModified,
            );
            if (previous < 0) return fileList;
            if (fileList.some((f, idx) => f.name === updateInstruction.name && previous !== idx)) {
                updateInstruction.errors = [...(updateInstruction.errors || []), 'Another file was uploaded with same name.'];
            }
            return validateStories([
                ...fileList.slice(0, previous),
                { ...fileList[previous], ...updateInstruction },
                ...fileList.slice(previous + 1),
            ]);
        }
        return fileList;
    };
    const storyFileReader = useReducer(reducer, []);
    return storyFileReader;
};

export const useDomainFileReader = ({ defaultDomain, fallbackImportLanguage, projectLanguages }) => {
    const reducer = (fileList, instruction) => {
        // eslint-disable-next-line no-use-before-define
        const setFileList = ins => domainFileReader[1](ins);
        const { delete: deleteInstruction, add: addInstruction, update: updateInstruction } = instruction;

        if (deleteInstruction) {
            const file = fileList.findIndex(
                cf => cf.filename === deleteInstruction.filename
                    && cf.lastModified === deleteInstruction.lastModified,
            );
            return [
                ...fileList.slice(0, file),
                ...fileList.slice(file + 1),
            ];
        }
        if (addInstruction) {
            // add: array of files
            const base = f => ({ filename: f.name, lastModified: f.lastModified });
            const newFileList = [
                ...fileList,
                ...addInstruction.map(f => ({
                    ...base(f), name: f.name,
                })),
            ];
            addInstruction.forEach((f) => {
                const reader = new FileReader();
                reader.readAsText(f);
                reader.onload = () => {
                    if (/\ufffd/.test(reader.result)) {
                        // out of range char test
                        return setFileList({
                            update: {
                                ...base(f),
                                errors: ['file is not parseable text'],
                            },
                        });
                    }
                    const {
                        errors, templates, slots, warnings,
                    } = loadDomain({
                        rawText: reader.result, defaultDomain, fallbackImportLanguage, projectLanguages,
                    });
                    return setFileList({
                        update: {
                            ...base(f), templates, slots, warnings, errors,
                        },
                    });
                };
            });
            return newFileList;
        }
        if (updateInstruction) {
            // callback for 'add' method
            const previous = fileList.findIndex(
                cf => cf.filename === updateInstruction.filename
                    && cf.lastModified === updateInstruction.lastModified,
            );
            if (previous < 0) return fileList;
            return [
                ...fileList.slice(0, previous),
                { ...fileList[previous], ...updateInstruction },
                ...fileList.slice(previous + 1),
            ];
        }
        return fileList;
    };
    const domainFileReader = useReducer(reducer, []);
    return domainFileReader;
};
