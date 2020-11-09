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
        const {
            delete: deleteInstruction,
            add: addInstruction,
            set: setInstruction,
        } = instruction;

        if (deleteInstruction) {
            const index = findFileInFileList(fileList, deleteInstruction);
            if (index < 0) return fileList;
            const newFileList = [
                ...fileList.slice(0, index),
                ...fileList.slice(index + 1),
            ];
            params.validateFunction(newFileList).then((data, err) => {
                if (err) return setFileList({ set: fileList }); // reset to previous state
                return setFileList({
                    set: newFileList.map((file, i) => {
                        const warnings = data[i]?.warnings || [];
                        const errors = data[i]?.errors || file.errors || [];
                        return addDataToFile(file, { validated: true, errors, warnings });
                    }),
                });
            });
            return newFileList.map(f => addDataToFile(f, { validated: false }));
        }
        if (addInstruction) {
            const addFileNameCheck = addInstruction.map((f, i) => {
                if (!f.name.match(/\.(ya?ml|json|md)/)) {
                    return addDataToFile(f, {
                        errors: ['File is not .zip, .json, .md or .yaml.'],
                    });
                }
                // console.log(addInstruction, fileList);
                // if (fileList.some((f_, i_) => f.name === f_.name && i !== i_)) {
                //     return addDataToFile(f, {
                //         errors: ['File with same filename uploaded.'],
                //     });
                // }
                return f;
            });
            const newFileList = [...fileList, ...addFileNameCheck];
            params.validateFunction(newFileList).then((data, err) => {
                if (err) return setFileList({ set: fileList }); // reset to previous state
                return setFileList({
                    set: newFileList.map((file, i) => {
                        const warnings = data[i]?.warnings || [];
                        const errors = data[i]?.errors || file.errors || [];
                        return addDataToFile(file, { validated: true, errors, warnings });
                    }),
                });
            });
            return newFileList.map(f => addDataToFile(f, { validated: false }));
        }
        if (setInstruction) return setInstruction;
        return fileList;
    };
    const fileReader = useReducer(reducer, []);
    return fileReader;
};
