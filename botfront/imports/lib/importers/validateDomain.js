import { safeLoad, safeDump } from 'js-yaml';
import { isEqual } from 'lodash';
import { Projects } from '../../api/project/project.collection';

const INTERNAL_SLOTS = ['bf_forms', 'fallback_language'];

const deduplicate = (listOfObjects, key) => {
    const seen = new Set();
    return listOfObjects.filter((obj) => {
        const value = obj[key];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
};


const deduplicateArray = (array) => {
    const seen = new Set();
    return array.filter((value) => {
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
};

export const mergeDomains = (files) => {
    const filesToProcess = files.filter(file => !(file.errors && file.errors.length > 0));
    if (!filesToProcess.length) return [];

    const allResponses = filesToProcess.reduce(
        (all, { responses = [] }) => [...responses, ...all],
        [],
    );
    const allSlots = filesToProcess.reduce((all, { slots = {} }) => [...slots, ...all], []);
    const allForms = filesToProcess.reduce((all, { forms = {} }) => ({ ...forms, ...all }), {});
    const allAction = filesToProcess.reduce((all, { actions = [] }) => [...all, ...actions], []);
    const mergedResponses = deduplicate(allResponses, 'key');
    const mergedSlots = deduplicate(allSlots, 'name');
    const mergedActions = deduplicateArray(allAction);
    return {
        slots: mergedSlots,
        responses: mergedResponses,
        forms: allForms,
        actions: mergedActions,
    };
};


export const mergeDomainsRasaFormat = (files) => {
    const filesToProcess = files.filter(file => !(file.errors && file.errors.length > 0));
    if (!filesToProcess.length) return [];
    const allResponses = filesToProcess.reduce((all, { responses = {} }) => ({ ...responses, ...all }), {});
    const allSlots = filesToProcess.reduce((all, { slots = {} }) => ({ ...all, ...slots }), {});
    const allForms = filesToProcess.reduce((all, { forms = {} }) => ({ ...forms, ...all }), {});
    const allAction = filesToProcess.reduce((all, { actions = [] }) => [...all, ...actions], []);
    const mergedActions = deduplicateArray(allAction); // we are not using a set to deduplicate to keep the order
    return {
        slots: allSlots,
        responses: allResponses,
        forms: allForms,
        actions: mergedActions,
    };
};

const validateADomain = (
    file,
    { defaultDomain = {}, projectLanguages = [], fallbackLang },
    // we validate domain and default domain with the same function
    // isDefaultDomain allow us to get the domain in rasaformat
    // and also trigget specific warning linked with default domain
    isDefaultDomain = false,
) => {
    const { rawText } = file;
    let domain;
    try {
        domain = safeLoad(rawText);
    } catch (e) {
        return {
            ...file,
            errors: [...(file?.errors || []), 'Not valid yaml'],
        };
    }
    const {
        slots: slotsFromFile = {},
        templates: legacyResponsesFromFile = {},
        responses: modernResponsesFromFile = {},
        forms: formsFromFile = {},
        actions: actionsFromFile = [],
    } = domain;
    const {
        slots: defaultSlots = {},
        responses: defaultResponses = {},
        forms: defaultForms = {},
    } = defaultDomain;
    const responsesFromFile = {
        ...(legacyResponsesFromFile || {}),
        ...(modernResponsesFromFile || {}),
    };
    // get forms MIGHT NEED TO UPDATE WITH RASA 2
    const bfForms = 'bf_forms' in (slotsFromFile || {}) ? slotsFromFile.bf_forms.initial_value : [];
    // do not import slots that are in current default domain or are programmatically generated
    [...Object.keys(defaultSlots), ...INTERNAL_SLOTS].forEach((k) => {
        delete slotsFromFile[k];
    });
    // do not import responses that are in current default domain
    Object.keys(defaultResponses).forEach((k) => {
        delete responsesFromFile[k];
    });
    // do not import forms that are in current default domain
    Object.keys(defaultForms).forEach((k) => {
        delete formsFromFile[k];
    });

    const warnings = [];
    const responses = [];
    let responsesRasaFormat = {};
    const slots = [];
    const newLanguages = new Set();
    Object.keys(responsesFromFile).forEach((key) => {
        const response = responsesFromFile[key];
        const values = [];
        let firstMetadataFound;
        response.forEach((item) => {
            const { language, metadata, ...rest } = item;
            const content = typeof item === 'string' ? safeDump({ text: item }) : safeDump(rest);
            const lang = language || fallbackLang;
            if (!firstMetadataFound && metadata) firstMetadataFound = metadata;
            if (firstMetadataFound && !isEqual(firstMetadataFound, metadata)) {
                warnings.push(
                    `Different metadata found for single response '${key}', but Botfront does not support it.`,
                );
            }
            if (!projectLanguages.includes(lang)) {
                warnings.push(
                    `Response '${key}' defined for '${lang}', but no such language used by project, importing this file will add support for the language`,
                );
                newLanguages.add(lang);
            }
            
            const valueIndex = values.findIndex(v => v.lang === lang);
            if (valueIndex > -1) {
                values[valueIndex].sequence = [
                    ...values[valueIndex].sequence,
                    { content },
                ];
            } else {
                values.push({ lang, sequence: [{ content }] });
            }
        });
        if (values.length) {
            responses.push({
                ...(firstMetadataFound ? { metadata: firstMetadataFound } : {}),
                values,
                key,
            });
            responsesRasaFormat = { [key]: response, ...responsesRasaFormat };
        }
    });

    
    // MIGHT NEED TO UPDATE WITH RASA 2
    Object.keys(slotsFromFile || {}).forEach((name) => {
        const slot = slotsFromFile[name];
        const options = {};
        if (slot.min_value) options.minValue = slot.min_value;
        if (slot.max_value) options.maxValue = slot.max_value;
        if (slot.initial_value) options.initialValue = slot.initial_value;
        if (slot.values) options.categories = slot.values;
        slots.push({
            name,
            type: slot.type,
            ...options,
        });
    });
    if (!isDefaultDomain && Object.keys(formsFromFile).length > 0) {
        warnings.push(
            'forms defined in this file will be added to the default domain on import',
        );
    }

    const actionsWithoutResponses = actionsFromFile.filter(action => (/^action_/.test(action)));
    const newDomain = {
        slots: isDefaultDomain ? slotsFromFile : slots,
        bfForms,
        responses: isDefaultDomain ? responsesRasaFormat : responses,
        actions: actionsWithoutResponses,
        forms: formsFromFile,
    };

    return {
        ...file,
        warnings: [...(file?.warnings || []), ...warnings],
        ...newDomain,
        newLanguages,
    };
};

export const validateDefaultDomains = (files, params) => {
    const { projectId } = params;
    let defaultDomain = {};
    let defaultDomainFiles = files.filter(file => file?.dataType === 'defaultdomain');
    defaultDomainFiles = defaultDomainFiles.map(domainFile => validateADomain(domainFile, params, true));

    if (defaultDomainFiles.length > 1) {
        let firstValidFileFound = false;
        defaultDomainFiles = defaultDomainFiles.map((domainFile) => {
            // we add warnings to all the files that valid except the first one
            if (!firstValidFileFound && !(domainFile.errors && domainFile.errors.length > 0)) {
                firstValidFileFound = true;
                return domainFile;
            } if (domainFile.errors && domainFile.errors.length > 0) {
                return domainFile; // we don't add warnings to files with errors already
            }
            return {
                ...domainFile,
                warnings: [
                    ...(domainFile?.warnings || []),
                    'You have multiple default domain files. if some data conflicts, the one from the first file with that data will be used (same way has rasa merges domains)',
                ],
            };
        });
    }


    if (defaultDomainFiles.length === 0) {
        defaultDomain = safeLoad(
            Projects.findOne({ _id: projectId }).defaultDomain.content,
        );
    } else {
        defaultDomain = mergeDomainsRasaFormat(defaultDomainFiles);
    }
    const newSummary = params.summary;

    if (defaultDomainFiles.length > 0) {
        const nameList = defaultDomainFiles.filter(file => !(file.errors && file.errors.length > 0)).map(file => file.filename).join(', ');
        newSummary.push(`You will remplace the default domain by ${nameList}`);
    }
    const newFiles = files.map((file) => {
        if (file?.dataType !== 'defaultdomain') return file;
        return defaultDomainFiles.shift();
    });
    return [
        newFiles,
        { ...params, defaultDomain, summary: newSummary },
    ];
};

export const validateDomain = (files, params) => {
    let domainFiles = files.filter(file => file?.dataType === 'domain');
    domainFiles = domainFiles.map(domainFile => validateADomain(domainFile, params));
    if (domainFiles.length > 1) {
        let firstValidFileFound = false;
        domainFiles = domainFiles.map((domainFile) => {
            // we add warnings to all the files that valid except the first one
            if (!firstValidFileFound && !(domainFile.errors && domainFile.errors.length > 0)) {
                firstValidFileFound = true;
                return domainFile;
            } if (domainFile.errors && domainFile.errors.length > 0) {
                return domainFile; // we don't add warnings to files with errors already
            }
            return {
                ...domainFile,
                warnings: [
                    ...(domainFile?.warnings || []),
                    'You have multiple default domain files. if some data conflicts, the one from the first file with that data will be used (same way has rasa merges domains)',
                ],
            };
        });
    }
   
    const newSummary = params.summary;
    let newLanguages = params.projectLanguages;

    if (domainFiles.length > 0) {
        const newLangs = domainFiles.reduce((all, file) => new Set([...file.newLanguages, ...all]), new Set());
        const merged = mergeDomains(domainFiles);
        const nameList = domainFiles.map(file => file.filename).join(', ');
        const slotsLen = merged.slots.length;
        const responsesLen = merged.responses.length;
        const formsLen = Object.keys(merged.forms).length;
        const actionsLen = merged.actions.length;
        const tempSummary = [];
        if (slotsLen > 0) tempSummary.push(`${slotsLen} slots`);
        if (responsesLen > 0) tempSummary.push(`${responsesLen} responses`);
        if (formsLen > 0) tempSummary.push(`${formsLen} forms`);
        if (actionsLen > 0) tempSummary.push(`${actionsLen} actions`);
        newSummary.push(`From ${nameList} you will add: ${tempSummary.join(', ')}`);
        newLanguages = Array.from(new Set([...params.projectLanguages, ...newLangs]));
    }
    return [
        files.map((file) => {
            if (file?.dataType !== 'domain') return file;
            return domainFiles.shift();
        }),
        { ...params, summary: newSummary, projectLanguages: newLanguages },
    ];
};
