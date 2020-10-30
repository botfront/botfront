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

export const validateInstances = (files, params) => [validateSimpleYamlFiles(files, 'instance'), params];
