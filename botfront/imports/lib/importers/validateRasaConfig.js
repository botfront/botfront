import yaml from 'js-yaml';
import { Projects } from '../../api/project/project.collection';

export const validateARasaConfig = (file, fallbackLang) => {
    let { pipeline, language, policies } = {};
    const errors = file?.errors || [];
    const warnings = file?.warnings || [];
    try {
        ({ pipeline, language, policies } = yaml.safeLoad(file.rawText));
    } catch {
        errors.push('Invalid YAML.');
        return { ...file, errors };
    }
    if (!pipeline && !policies) {
        errors.push('No pipeline or policies in this file.');
        return { ...file, errors };
    }
    if (!language) {
        warnings.push(`No language specified for pipeline, using '${fallbackLang}'.`);
        language = fallbackLang;
    }
    return {
        ...file,
        ...(pipeline ? { pipeline } : {}),
        ...(language ? { language } : {}),
        ...(policies ? { policies } : {}),
        warnings,
    };
};

const langSummary = (rasaConfigFile, projectLangs) => {
    if (!rasaConfigFile) return null;
    if (rasaConfigFile.errors && rasaConfigFile.errors.length > 0) return null;
    if (!rasaConfigFile.language) return null;
    if (projectLangs.has(rasaConfigFile.language)) {
        return `Pipeline for language '${rasaConfigFile.language}' will be overwritten by ${rasaConfigFile.filename}.`;
    }
    return `Pipeline for new language model '${rasaConfigFile.language}' will be imported from ${rasaConfigFile.filename}.`;
};

const validateRasaConfigTogether = (files, projectId) => {
    const languagesFromProject = new Set(Projects.findOne({ _id: projectId }).languages);
    const languagesFromFiles = new Set();
    const summary = [];
    let policiesFoundIn = '';
    const pipelinePerLang = {};
    const configFiles = files.map((rasaConfigFile) => {
        const {
            pipeline, language, policies, filename, warnings, errors,
        } = rasaConfigFile;
        if (errors) return rasaConfigFile;
        const newWarnings = [];
        languagesFromFiles.add(language);
        if (pipeline && pipelinePerLang[language]) {
            newWarnings.push(
                `Dropped pipeline, since a pipeline for '${language}' is found in another import file.`,
            );
        }
        if (pipeline && !pipelinePerLang[language]) {
            pipelinePerLang[language] = filename;
            summary.push(langSummary(rasaConfigFile, languagesFromProject));
        }

        if (policies && policiesFoundIn !== '') {
            newWarnings.push(
                `Dropped policies, since policies are already found in file ${policiesFoundIn}.`,
            );
        }

        if (policies && policiesFoundIn === '') {
            summary.push(`Policies will be overwritten by ${filename}.`);
            policiesFoundIn = filename;
        }
        return {
            ...rasaConfigFile,
            warnings: [...(warnings || []), ...newWarnings],
        };
    });
    const projectLanguages = Array.from(new Set([...languagesFromProject, ...languagesFromFiles]));
    return [configFiles, summary, projectLanguages];
};

export const validateRasaConfig = (files, params) => {
    const { projectId, fallbackLang } = params;
    let summary = [];
    let projectLanguages = [];

    let rasaConfigFiles = files.filter(f => f?.dataType === 'rasaconfig');

    rasaConfigFiles = rasaConfigFiles.map(rasaConfigFile => validateARasaConfig(rasaConfigFile, fallbackLang));
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
