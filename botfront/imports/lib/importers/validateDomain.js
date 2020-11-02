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

export const mergeDomains = (files) => {
    if (!files.length) return [];
    const allResponses = files.reduce(
        (all, { responses = [] }) => [...all, ...responses],
        [],
    );
    const allSlots = files.reduce((all, { slots = [] }) => [...all, ...slots], []);
    const allForms = files.reduce((all, { forms = {} }) => ({ ...forms, ...all }), {});
    const allAction = files.reduce((all, { actions = [] }) => [...actions, ...all], []);
    const mergedResponses = deduplicate(allResponses, 'key');
    const mergedSlots = deduplicate(allSlots, 'name');
    const mergedActions = Array.from(new Set(allAction));
    return {
        slots: mergedSlots,
        responses: mergedResponses,
        forms: allForms,
        actions: mergedActions,
    };
};

const validateADomain = (
    file,
    { defaultDomain = {}, projectLanguages = [], fallbackLang },
    isDefaultDomain = false, // we validate domain and default domain with the same function
) => {
    const { rawText } = file;
    let domain;
    try {
        domain = safeLoad(rawText);
    } catch (e) {
        return {
            ...file,
            errors: [...(file?.errors || []), 'Not valid yaml'],
        };
    }
    const {
        slots: slotsFromFile = {},
        templates: legacyResponsesFromFile = {},
        responses: modernResponsesFromFile = {},
        forms: formsFromFile = {},
        actions: actionsFromFile = {},
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
    const slots = [];

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
                    `Response '${key}' defined for '${lang}', but no such language used by project.`,
                );
            } else {
                const valueIndex = values.findIndex(v => v.lang === lang);
                if (valueIndex > -1) {
                    values[valueIndex].sequence = [
                        ...values[valueIndex].sequence,
                        { content },
                    ];
                } else {
                    values.push({ lang, sequence: [{ content }] });
                }
            }
        });
        if (values.length) {
            responses.push({
                ...(firstMetadataFound ? { metadata: firstMetadataFound } : {}),
                values,
                key,
            });
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
    return {
        ...file,
        warnings: [...(file?.warnings || []), ...warnings],
        slots,
        bfForms,
        responses,
        actions: actionsFromFile,
        forms: formsFromFile,
    };
};

export const validateDefaultDomains = (files, params) => {
    const { projectId } = params;
    let defaultDomain = {};
    let defaultDomainFiles = files.filter(file => file?.dataType === 'defaultdomain');
    if (defaultDomainFiles.length > 1) {
        defaultDomainFiles = defaultDomainFiles.map((domainFile, idx) => {
            if (idx === 0) {
                return domainFile;
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

    defaultDomainFiles = defaultDomainFiles.map(domainFile => validateADomain(domainFile, params, true));

    if (defaultDomainFiles.length === 0) {
        defaultDomain = safeLoad(
            Projects.findOne({ _id: projectId }).defaultDomain.content,
        );
    } else {
        defaultDomain = mergeDomains(defaultDomainFiles);
    }
  
    const newSummary = params.summary;

    if (defaultDomainFiles.length > 0) {
        const nameList = defaultDomainFiles.map(file => file.filename).join(', ');
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
    if (domainFiles.length > 1) {
        domainFiles = domainFiles.map((domainFile, idx) => {
            if (idx === 0) {
                return domainFile;
            }
            return {
                ...domainFile,
                warnings: [
                    ...(domainFile?.warnings || []),
                    'You have multiple domain files if some data conflicts, the one from the first file with that data will be used (same ways has rasa merges domains)',
                ],
            };
        });
    }
    domainFiles = domainFiles.map(domainFile => validateADomain(domainFile, params));
   
    const newSummary = params.summary;

    if (domainFiles.length > 0) {
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
    }
    return [
        files.map((file) => {
            if (file?.dataType !== 'domain') return file;
            return domainFiles.shift();
        }),
        params,
    ];
};
