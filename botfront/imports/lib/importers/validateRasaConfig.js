import yaml from 'js-yaml';
import { Projects } from '../../api/project/project.collection';

export const validateARasaConfig = (file) => {
    let rasaConfig;
    const errors = [];
    try {
        rasaConfig = yaml.safeLoad(file.rawText);
    } catch (e) {
        return {
            ...file,
            errors: [...(file?.errors || []), 'Not valid yaml'],
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
            ...file,
            errors: [...(file?.errors || []), ...errors],
        };
    }
    return {
        ...file,
        ...rasaConfig,
    };
};

const langSummary = (rasaConfigFile, projectLangs) => {
    if (projectLangs.has(rasaConfigFile.language)) {
        return `The pipeline for the language "${rasaConfigFile.language}" will be remplace by the one from the file ${rasaConfigFile.filename}`;
    }
    return `${rasaConfigFile.filename} will add the support for the language "${rasaConfigFile.language}"`;
};

const validateRasaConfigTogether = (files, projectId) => {
    const languagesFromProject = new Set(Projects.findOne({ _id: projectId }).languages);
    const languagesFromFiles = new Set();
    const summary = [];
    let configFiles = files;
    if (files.length > 1) {
        configFiles = configFiles.map((rasaConfigFile, idx) => {
            if (languagesFromFiles.has(rasaConfigFile.language)) {
                return {
                    ...rasaConfigFile,
                    errors: [
                        ...(rasaConfigFile.errors || []),
                        'There is already a config file for the lang, this file won\'t be used in the import',
                    ],
                };
            }
            summary.push(langSummary(rasaConfigFile, languagesFromProject));

            if (idx === 0) {
                languagesFromFiles.add(rasaConfigFile.language);
                return rasaConfigFile;
            }

            languagesFromFiles.add(rasaConfigFile.language);
            return {
                ...rasaConfigFile,
                warnings: [
                    ...(rasaConfigFile.warnings || []),
                    `Policies from this file conflicts with policies from ${files[0].filename}, and thus they won't be used in the import`,
                ],
            };
        });
    } else {
        summary.push(langSummary(configFiles[0], languagesFromProject));
    }
    const projectLanguages = Array.from([...languagesFromProject, ...languagesFromFiles]);
    return [configFiles, summary, projectLanguages];
};

export const validateRasaConfig = (files, params) => {
    const { projectId } = params;
    let summary = [];
    let projectLanguages = [];

    let rasaConfigFiles = files.filter(f => f?.dataType === 'rasaconfig');

    rasaConfigFiles = rasaConfigFiles.map(rasaConfigFile => validateARasaConfig(rasaConfigFile));
    [rasaConfigFiles, summary, projectLanguages] = validateRasaConfigTogether(
        rasaConfigFiles,
        projectId,
    );

    const newFiles = files.map((file) => {
        if (file?.dataType !== 'rasaconfig') return file;
        return rasaConfigFiles.shift();
    });
    return [
        newFiles,
        {
            ...params,
            summary: [...params.summary, ...summary],
            projectLanguages,
        },
    ];
};
