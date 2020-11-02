import yaml from 'js-yaml';
import { Projects } from '../../api/project/project.collection';

export const validateARasaConfig = (file, fallbackLang) => {
    let rasaConfig;
    const errors = [];
    const warnings = [];
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
    if (!configsKeys.includes('language')) {
        warnings.push('is missing a language key, it will use the fallback one');
        rasaConfig.language = fallbackLang;
    }
    if (configsKeys.includes('language') && !configsKeys.includes('pipeline') && !configsKeys.includes('policies')) {
        warnings.push('No pipeline or policies in this file');
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
    if (!rasaConfigFile) return null;
    if (rasaConfigFile.errors && rasaConfigFile.errors.length > 0) return null;
    if (projectLangs.has(rasaConfigFile.language) && rasaConfigFile.pipeline) {
        return `The pipeline for the language "${rasaConfigFile.language}" will be remplace by the one from the file ${rasaConfigFile.filename}`;
    }
    if (!rasaConfigFile.pipeline) {
        return `${rasaConfigFile.filename} will add the support for the language "${rasaConfigFile.language}" using the default pipeline`;
    }
    return `${rasaConfigFile.filename} will add the support for the language "${rasaConfigFile.language}"`;
};

const validateRasaConfigTogether = (files, projectId) => {
    const languagesFromProject = new Set(Projects.findOne({ _id: projectId }).languages);
    const languagesFromFiles = new Set();
    const summary = [];
    let configFiles = files;
    let policiesFoundIn = '';
    const pipelinePerLang = {};
    if (files.length > 1) {
        configFiles = configFiles.map((rasaConfigFile) => {
            const {
                pipeline, language, policies, filename, warnings,
            } = rasaConfigFile;
            const newWarnings = [];
            languagesFromFiles.add(language);
            if (pipeline && pipelinePerLang[language]) {
                newWarnings.push('There is already a config file with a pipeline for this lang, this data won\'t be used in the import');
            }
            if (pipeline && !pipelinePerLang[language]) pipelinePerLang[language] = filename;
            summary.push(langSummary(rasaConfigFile, languagesFromProject));

            if (policies && policiesFoundIn !== '') {
                newWarnings.push(`Policies from this file conflicts with policies from ${policiesFoundIn}, and thus they won't be used in the import`);
            }

            if (policies && policiesFoundIn === '') {
                summary.push(`Policies will be remplaced by the ones from ${filename}`);
                policiesFoundIn = filename;
            }
            return {
                ...rasaConfigFile,
                warnings: [
                    ...(warnings || []), ...newWarnings,
                ],
            };
        });
    } else {
        const configFile = configFiles[0];
        const langMessage = langSummary(configFile, languagesFromProject);
        if (langMessage) summary.push(langMessage);
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
