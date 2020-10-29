import yaml from 'js-yaml';

export const doValidation = params => !params.noValidate;

export const validateSimpleYamlFiles = (files, type) => {
    let filesToValid = files.filter(f => f?.dataType === type);
    if (filesToValid.length > 1) {
        filesToValid = filesToValid.map((file, idx) => {
            if (idx === 0) {
                return file;
            }
            return {
                ...file,
                warnings: [
                    ...(file.warnings || []),
                    `Conflicts with ${file[0].filename}, and thus won't be used in the import`,
                ],
            };
        });
    }
    filesToValid = filesToValid.map((file) => {
        let parsed;
        try {
            parsed = yaml.safeLoad(file.rawText);
        } catch (e) {
            return {
                ...file,
                errors: [...(file?.errors || []), 'Not valid yaml'],
            };
        }
        return {
            ...file,
            [type]: parsed,
        };
    });
    return files.map((file) => {
        if (file?.dataType !== type) return file;
        return filesToValid.shift();
    });
};

export const validateSimpleJsonFiles = (files, type) => {
    let filesToValid = files.filter(f => f?.dataType === type);
    filesToValid = filesToValid.map((file) => {
        let parsed;
        try {
            parsed = JSON.parse(file.rawText);
        } catch (e) {
            return {
                ...file,
                errors: [...(file?.errors || []), 'Not valid json'],
            };
        }
        if (!Array.isArray(parsed) || parsed.length < 1) {
            return {
                file,
                warnings: [
                    ...(file?.warnings || []),
                    `There are no ${type} in this file`,
                ],
            };
        }
        return {
            ...file,
            [type]: parsed,
        };
    });
    return files.map((file) => {
        if (file?.dataType !== type) return file;
        return filesToValid.shift();
    });
};

export const validateEndpoints = (files, params) => [
    validateSimpleYamlFiles(files, 'endpoints'),
    params,
];

export const validateCredentials = (files, params) => [
    validateSimpleYamlFiles(files, 'credentials'),
    params,
];

export const validateIncoming = (files, params) => [
    validateSimpleJsonFiles(files, 'incoming'),
    params,
];

export const validateConversations = (files, params) => [
    validateSimpleJsonFiles(files, 'incoming'),
    params,
];

export const validateRasaConfig = (files, params) => {
    let rasaConfigFiles = files.filter(f => f?.dataType === 'rasaconfig');
    if (rasaConfigFiles.length > 1) {
        rasaConfigFiles = rasaConfigFiles.map((rasaConfigFile, idx) => {
            if (idx === 0) {
                return rasaConfigFile;
            }
            return {
                ...rasaConfigFile,
                warnings: [
                    ...(rasaConfigFile.warnings || []),
                    `Policies from this file conflicts with policies from ${rasaConfigFiles[0].filename}, and thus they won't be used in the import`,
                ],
            };
        });
    }
    rasaConfigFiles = rasaConfigFiles.map((rasaConfigFile) => {
        let rasaConfig;
        const errors = [];
        try {
            rasaConfig = yaml.safeLoad(rasaConfigFile.rawText);
        } catch (e) {
            return {
                ...rasaConfigFile,
                errors: [...(rasaConfigFile?.errors || []), 'Not valid yaml'],
            };
        }

        const configsKeys = Object.keys(rasaConfig);
        configsKeys.forEach((key) => {
            if (!['pipeline', 'policies', 'language'].includes(key)) {
                errors.push(`${key} is not a valid rasa config data`);
            }
        });
        if (configsKeys.length < 3) {
            const missingKeys = ['pipeline', 'policies', 'language'].filter(
                key => !configsKeys.includes(key),
            );
            errors.push(`${missingKeys.join(', ')} missing in the rasa config data`);
        }
        if (errors.length > 0) {
            return {
                ...rasaConfigFile,
                errors: [...(rasaConfigFile?.errors || []), ...errors],
            };
        }
        return {
            ...rasaConfigFile, ...rasaConfig,
        };
    });
   
    const newFiles = files.map((file) => {
        if (file?.dataType !== 'rasaconfig') return file;
        const a = rasaConfigFiles.shift();
        return a;
    });
    return [
        newFiles,
        params,
    ];
};

// if (projectConfig === null) {
//     const project = await Project.findOne({ _id: params.projectId }).lean();
//     projectLanguages = project.languages;
//     ({ defaultDomain } = project);
// } else {
//     projectLanguages = projectConfig.languages;
//     ({ defaultDomain } = projectConfig);
// }

export const validateDefaultDomains = (files, params) => [files, params];

export const validateInstances = (files, params) => [files, params];

// export const validateDefaultDomain= (files, params) {
//     file, params,
// }) => {

//     let filesWithMessages = files

//     const errors = [];
//     const { rawText } = file;

//     let bfConfig;
//     try {
//         bfConfig = yaml.safeLoad(rawText);
//     } catch (e) {
//         return {
//             ...file, errors: [...(file?.errors || []), ['Not valid yaml']],
//         };
//     } if (doValidation(params)) {
//         const configsKeys = Object.keys(bfConfig);
//         configsKeys.forEach((key) => {
//             if (!['project', 'instance'].includes(key)) {
//                 errors.push(`${key} is not valid botfront data`);
//             }
//         });
//         if (configsKeys.length < 2) {
//             const missingKeys = ['project', 'instance'].filter(key => !configsKeys.includes(key));
//             errors.push(`${missingKeys.join(', ')} missing in the rasa config data`);
//         }
//         if (errors.length > 0) {
//             return {
//                 ...file, errors: [...(file?.errors || []), ...errors],
//             };
//         }
//     }

//     return {
//         ...file, ...bfConfig,
//     };
// };
