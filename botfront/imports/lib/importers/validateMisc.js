import yaml from 'js-yaml';
import { Instances } from '../../api/instances/instances.collection';

export const doValidation = params => !params.noValidate;

export const validateSimpleYamlFiles = (files, params, type) => {
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

    const newSummary = params.summary;
    if (filesToValid.length > 0) newSummary.push(`You will remplace ${type} by the one in ${filesToValid[0].filename}`);

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
  

export const validateInstances = (files, params) => {
    const [newFiles, newParams] = validateSimpleYamlFiles(files, params, 'instance');
    const instanceFiles = newFiles.filter(f => f?.dataType === 'instance');
    if (instanceFiles.length > 0) {
        newParams.instanceHost = instanceFiles[0].instance.host;
    } else {
        newParams.instanceHost = Instances.findOne({ projectId: params.projectId }).host;
    }
    return [newFiles, newParams];
};


export const validateIncoming = (files, params) => validateSimpleJsonFiles(files, params, 'incoming');
 

export const validateConversations = (files, params) => validateSimpleJsonFiles(files, params, 'conversations');
