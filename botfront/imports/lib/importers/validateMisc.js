import yaml from 'js-yaml';
import { Instances } from '../../api/instances/instances.collection';

export const doValidation = params => !params.noValidate;

export const validateSimpleYamlFiles = (files, params, type, alias = type) => {
    let filesToValid = files.filter(f => f?.dataType === type);
    filesToValid = filesToValid.map((file) => {
        let parsed;
        try {
            parsed = yaml.safeLoad(file.rawText);
        } catch (e) {
            return {
                ...file,
                errors: [...(file?.errors || []), `Not valid yaml: ${e.message}`],
            };
        }
        return {
            ...file,
            [type]: parsed,
        };
    });
    if (filesToValid.length > 1) {
        let firstValidFileFound = false;
        filesToValid = filesToValid.map((file) => {
            if (!firstValidFileFound && !(file.errors && file.errors.length > 0)) {
                firstValidFileFound = true;
                return file;
            } if (file.errors && file.errors.length > 0) {
                return file; // we don't add warnings to files with errors already
            }
            return {
                ...file,
                warnings: [
                    ...(file.warnings || []),
                    `Conflicts with ${filesToValid[0].filename}, and thus won't be used in the import`,
                ],
            };
        });
    }
  

    const newSummary = params.summary;
    if (filesToValid.length > 0) newSummary.push(`You will remplace ${alias} by the one in ${filesToValid[0].filename}`);

    const newFiles = files.map((file) => {
        if (file?.dataType !== type) return file;
        return filesToValid.shift();
    });
    return [newFiles, { ...params, summary: newSummary }];
};

export const validateSimpleJsonFiles = (files, params, type) => {
    let filesToValid = files.filter(f => f?.dataType === type);
    let count = 0;
    filesToValid = filesToValid.map((file) => {
        let parsed;
        try {
            parsed = JSON.parse(file.rawText);
        } catch (e) {
            return {
                ...file,
                errors: [...(file?.errors || []), `Not valid json: ${e.message}`],
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
        count += parsed.length;
        
        return {
            ...file,
            [type]: parsed,
        };
    });
    
    const newSummary = params.summary;
    if (count > 0) newSummary.push(`You will add ${count} ${type}`);

    const newFiles = files.map((file) => {
        if (file?.dataType !== type) return file;
        return filesToValid.shift();
    });
    return [newFiles, { ...params, summary: newSummary }];
};

export const validateEndpoints = (files, params) => validateSimpleYamlFiles(files, params, 'endpoints');

export const validateCredentials = (files, params) => validateSimpleYamlFiles(files, params, 'credentials');

export const validateBfConfig = (files, params) => {
    const [newFiles, newParams] = validateSimpleYamlFiles(files, params, 'bfconfig', 'botfront config');
    const bfConfigFiles = newFiles.filter(f => f?.dataType === 'bfconfig');
    if (bfConfigFiles.length > 0 && (!bfConfigFiles[0].errors || bfConfigFiles[0].errors.length === 0)) {
        newParams.instanceHost = bfConfigFiles[0].bfconfig.instance.host;
    } else {
        newParams.instanceHost = Instances.findOne({ projectId: params.projectId }).host;
    }
    return [newFiles, newParams];
};

export const validateIncoming = (files, params) => validateSimpleJsonFiles(files, params, 'incoming');

export const validateConversations = (files, params) => validateSimpleJsonFiles(files, params, 'conversations');
