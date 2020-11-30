import yaml from 'js-yaml';
import { Instances } from '../../api/instances/instances.collection';
import { onlyValidFiles } from './common';


export const validateSimpleYamlFiles = (files, params, type, alias = type) => {
    const { supportedEnvs } = params;
    const envInFiles = {};
    const newSummary = params.summary;
    let filesToValid = files.filter(f => f?.dataType === type);
    filesToValid = filesToValid.map((file) => {
        let parsed;
        const warnings = [];
        const { filename } = file;
        try {
            parsed = yaml.safeLoad(file.rawText);
        } catch (e) {
            return {
                ...file,
                errors: [...(file?.errors || []), `Not valid yaml: ${e.message}`],
            };
        }
        const extractEnv = new RegExp(`(?<=${type}(\\.|-))(.*)(?=\\.ya?ml)`);
        
        const extractedEnv = extractEnv.exec(filename);
        const env = extractedEnv ? extractedEnv[0] : 'development';
        if (env) {
            if (!supportedEnvs.includes(env)) {
                warnings.push(`The "${env}" environment is not supported by this project, this file won't be used in the import`);
            } else if (envInFiles[env]) {
                warnings.push(`Conflicts with ${envInFiles[env]}, and thus won't be used in the import`);
            } else {
                envInFiles[env] = filename;
                newSummary.push(`${alias.charAt(0).toUpperCase() + alias.slice(1)}${supportedEnvs.length > 1 ? ` for ${env} ` : ' '}will be imported from ${filename}.`);
            }
        }
        return {
            ...file,
            [type]: parsed,
            warnings: [...(file.warnings || []), ...warnings],
            env,
        };
    });

    const newFiles = files.map((file) => {
        if (file?.dataType !== type) return file;
        return filesToValid.shift();
    });
    return [newFiles, { ...params, summary: newSummary }];
};

export const validateSimpleJsonFiles = (files, params, type) => {
    const { supportedEnvs } = params;
    let filesToValid = files.filter(f => f?.dataType === type);
    const countPerEnv = {};
    filesToValid = filesToValid.map((file) => {
        let parsed;
        const warnings = [];
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
        const extractEnv = new RegExp(`(?<=${type}(\\.|-))(.*)(?=\\.json)`);
        const extractedEnv = extractEnv.exec(file.filename);
      
        const env = extractedEnv ? extractedEnv[0] : 'development';

        if (!supportedEnvs.includes(env)) {
            warnings.push(`The "${env}" environment is not supported by this project, this file won't be used in the import`);
        }

        if (!countPerEnv[env]) {
            countPerEnv[env] = 0;
        }
        countPerEnv[env] += parsed.length;
        
        return {
            ...file,
            [type]: parsed,
            warnings: [...(file.warnings || []), ...warnings],
            env,
        };
    });
    
    const newSummary = params.summary;
    if (supportedEnvs.length > 1 && filesToValid.length > 0) {
        supportedEnvs.forEach((env) => {
            if (countPerEnv[env] !== undefined) newSummary.push(`You will add ${countPerEnv[env]} ${type} in ${env}`);
        });
    } else if (filesToValid.length > 0 && countPerEnv.development !== undefined) {
        newSummary.push(`You will add ${countPerEnv.development} ${type}`);
    }
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
    const onlyValidConfigFiles = onlyValidFiles(bfConfigFiles);
    if (onlyValidConfigFiles.length > 0 && onlyValidConfigFiles[0].bfconfig.instance) {
        newParams.instanceHost = onlyValidConfigFiles[0].bfconfig.instance.host;
    } else {
        newParams.instanceHost = Instances.findOne({ projectId: params.projectId }).host;
    }
    return [newFiles, newParams];
};

export const validateIncoming = (files, params) => {
    const { projectLanguages } = params;
    const [newFiles, newParams] = validateSimpleJsonFiles(files, params, 'incoming');
    let incomingFiles = newFiles.filter(f => f?.dataType === 'incoming');
    if (incomingFiles.length > 0) {
        incomingFiles = incomingFiles.map((file) => {
            const { incoming } = file;
            if (incoming && incoming.length > 0) {
                const langInFiles = incoming.reduce((acc, { language }) => {
                    acc.add(language);
                    return acc;
                }, new Set());
                const langNotSupported = [...langInFiles].filter(lang => !projectLanguages.includes(lang));
                if (langNotSupported.length > 0) {
                    return {
                        ...file,
                        warnings: [
                            ...(file?.warnings || []),
                            {
                                text: 'This file contains incoming for unsupported languages that won\'t be accessible after import',
                                longText: `This file contains langs "${langNotSupported.join(', ')}" that are not supported by the project,
                                the imported utterances in those lang won't be accessible until you add those languages to the project`,
                            },
                        ],
                    };
                }
            }
            return file;
        });
    }

    const updatedFiles = newFiles.map((file) => {
        if (file?.dataType !== 'incoming') return file;
        return incomingFiles.shift();
    });

    return [updatedFiles, newParams];
};

export const validateConversations = (files, params) => validateSimpleJsonFiles(files, params, 'conversations');
