import { useReducer } from 'react';
import {
    update,
    findFileInFileList,
    updateAtIndex,
    deleteAtIndex,
} from '../../../lib/importers/common';
import {
    validateStories,
} from '../../../lib/importers/loadStories';


const addDataToFile = (file, data) => {
    const newFile = file;
    Object.keys(data).forEach((key) => {
        newFile[key] = data[key];
    });
    return newFile;
};

// TO RE WORK WITH NEW STORIES
const validateFiles = files => validateStories(files);


export const useFileReader = (params) => {
    const reducer = (fileList, instruction) => {
        // eslint-disable-next-line no-use-before-define
        const setFileList = ins => fileReader[1](ins);
        const {
            delete: deleteInstruction,
            add: addInstruction,
            update: updateInstruction,
            changeLang: changeLangInstruction,
            wipe: wipeInstruction,
        } = instruction;

        if (deleteInstruction) {
            const index = findFileInFileList(fileList, deleteInstruction);
            if (index < 0) return fileList;
            const newFileList = deleteAtIndex(fileList, index);
            params.validateFunction(newFileList).then((data) => {
                newFileList.forEach((file, i) => {
                    const warnings = data[i].warnings || [];
                    const errors = data[i].errors || file.errors || [];
                    update(setFileList, addDataToFile(file, { validated: true, errors, warnings }));
                });
            });
            return newFileList.map(f => (addDataToFile(f, { validated: false })));
        }
        if (addInstruction) {
            // eslint-disable-next-line consistent-return
            const addFileNameCheck = addInstruction.map((f) => {
                if (f.name.match(/\.(yml|json|md)/)) {
                    return (f);
                }
                return addDataToFile(f, { errors: ['file is neither .zip, .json or.yaml'] });
            });
            params.validateFunction(addFileNameCheck).then((data) => {
                addFileNameCheck.forEach((file, index) => {
                    const warnings = data[index].warnings || [];
                    // file.errors are errors that are detected on the client side
                    // data[index].errors are errros that are detected on the server side
                    // file that have errors in the client are not sent to the server
                    // that why we use the server error then, the client error
                    const errors = data[index].errors || file.errors || [];
                    update(setFileList, addDataToFile(file, { validated: true, errors, warnings }));
                });
            });
           
            return [...fileList, ...addFileNameCheck.map(f => (addDataToFile(f, { validated: false })))];
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
            // TO RE WORK WITH NEW STORIES
            return validateFiles(updateAtIndex(fileList, index, updateInstruction));
        }
        if (changeLangInstruction) {
            // TO RE WORK WITH NEW STORIES
            return fileList.map(f =>
                // if (f.dataType === 'domain') {
                //     return {
                //         ...f,
                //         ...loadDomain({
                //             ...f,
                //             ...params,
                //             fallbackImportLanguage: changeLangInstruction,
                //         }),
                //     };
                // }
                // if (f.dataType === 'nlu') {
                //     return {
                //         ...f,
                //         language: getLanguage(f.rawText, changeLangInstruction),
                //     };
                // }
                f);
        }
        if (wipeInstruction) {
            // TO RE WORK WITH NEW STORIES
            // if (addInstruction.some(f => f.dataType === 'stories' && f.firstLine)) {
            //     // file already there, but data wiping toggled, so just need to change storygroup name
            //     return fileList.map((f) => {
            //         if (f.dataType !== 'stories' || !f.firstLine) return f;
            //         const { name } = fileToStoryGroup(f.filename, f.firstLine, [
            //             ...(params.existingStoryGroups || []),
            //         ]);
            //         return { ...f, name };
            //     });
            // }
        }
        return fileList;
    };
    const fileReader = useReducer(reducer, []);
    return fileReader;
};
