import { useReducer } from 'react';

const findFileInFileList = (fileList, file) => fileList.findIndex(
    cf => cf.filename === file.filename && cf.lastModified === file.lastModified,
);

const addDataToFile = (file, data) => {
    const newFile = new File([file], file.name);
    Object.keys(data).forEach((key) => {
        newFile[key] = data[key];
    });
    if (!newFile.filename) newFile.filename = newFile.name;
    return newFile;
};

export const useFileReader = (params) => {
    const reducer = (fileList, instruction) => {
        // eslint-disable-next-line no-use-before-define
        const setFileList = ins => fileReader[1](ins);

        const setFileListAfterRecompute = update => params.validateFunction(update).then((data, err) => {
            if (err) return setFileList({ set: fileList }); // reset to previous state
            return setFileList({
                set: update.map((file, i) => {
                    const warnings = data[i]?.warnings || [];
                    const errors = data[i]?.errors || file.errors || [];
                    return addDataToFile(file, { validated: true, errors, warnings });
                }),
            });
        });

        const {
            delete: deleteInstruction,
            add: addInstruction,
            set: setInstruction,
            reset: resetInstruction,
            reload: reloadInstruction,
        } = instruction;

        if (deleteInstruction) {
            const index = findFileInFileList(fileList, deleteInstruction);
            if (index < 0) return fileList;
            const newFileList = [
                ...fileList.slice(0, index),
                ...fileList.slice(index + 1),
            ];
            setFileListAfterRecompute(newFileList);
            return newFileList.map(f => addDataToFile(f, { validated: false }));
        }
        if (addInstruction) {
            const addFileNameCheck = addInstruction.map((f) => {
                if (!f.name.match(/\.(ya?ml|json|md)/)) {
                    return addDataToFile(f, {
                        errors: ['File is not .zip, .json, .md or .yaml.'],
                    });
                }
                return f;
            });
            const newFileList = [...fileList, ...addFileNameCheck];
            setFileListAfterRecompute(newFileList);
            return newFileList.map(f => addDataToFile(f, { validated: false }));
        }
        if (reloadInstruction) {
            setFileListAfterRecompute(fileList);
            return fileList.map(f => addDataToFile(f, { validated: false }));
        }
        if (resetInstruction) return [];
        if (setInstruction) return setInstruction;
        return fileList;
    };
    const fileReader = useReducer(reducer, []);
    return fileReader;
};
