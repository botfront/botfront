import { safeLoad, safeDump } from 'js-yaml';
import { isEqual } from 'lodash';
import { Projects } from '../../api/project/project.collection';
import { onlyValidFiles } from './common';

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

// deduplicate response and merge them by lang
export const deduplicateAndMergeResponses = (listOfResponse) => {
    // for a said key, seen will store supported lang and where the response is in the final array
    // eg. { utter_test: { langs :['en','fr'], index: 2 }};
    const seen = {};
    return listOfResponse.reduce((all, resp) => {
        const { key } = resp;
        const respSeen = seen[key];
        if (respSeen) { // the reponse was already added
            const insertIndex = respSeen.index;
            // we filter out lang already supported for a said key
            const langToAdd = resp.values.filter(val => (
                !respSeen.langs.includes(val.lang)));
            // add newly supported lang to the seen ones
            const newLangs = langToAdd.map(val => val.lang);
            seen[key] = { langs: [...respSeen.langs, ...newLangs], index: insertIndex };
            // update the final array
            const updatedResp = all[insertIndex];
            updatedResp.values.push(...langToAdd);
            return [...all.slice(0, insertIndex), updatedResp, ...all.slice(insertIndex + 1)];
        }
        // it's the first time we see this response
        // list all lang supported
        const langs = resp.values.map(val => val.lang);
        //  add those to the seen, as well as the index
        seen[key] = { langs, index: all.length };
        // add the response
        return [...all, resp];
    }, []);
};


export const deduplicateArray = (array) => {
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
    if (!filesToProcess.length) {
        return {
            slots: [],
            responses: [],
            forms: {},
            actions: [],
        };
    }
    const allResponses = filesToProcess.reduce(
        (all, { responses = [] }) => [...all, ...responses],
        [],
    );
    // the order of merging is important
    // for arrays [...all, ...slots] => will keep the first one during deduplication
    // for obj { ...forms, ...all } => the first one found erase the new one
    const allSlots = filesToProcess.reduce((all, { slots = [] }) => [...all, ...slots], []);
    const allForms = filesToProcess.reduce((all, { forms = {} }) => ({ ...forms, ...all }), {});
    const allAction = filesToProcess.reduce((all, { actions = [] }) => [...all, ...actions], []);
    const mergedResponses = deduplicateAndMergeResponses(allResponses);
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
    const filesToProcess = onlyValidFiles(files);
    if (!filesToProcess.length) {
        return {
            slots: {},
            responses: {},
            forms: {},
            actions: [],
        };
    }
    // the order of merging is important
    // for arrays [...all, ...slots] => will keep the first one during deduplication
    // for obj { ...forms, ...all } => the first one found erase the new one

    const allResponses = filesToProcess.reduce((all, { responses = {} }) => {
        let toInsert = {};
        Object.keys(responses).forEach((respKey) => {
            const currentResp = responses[respKey];
            if (all[respKey]) {
                const existingResps = all[respKey];
                // the existing one are put in first so during deduplication they will be kept
                const newResp = deduplicate([...existingResps, ...currentResp], 'lang');
                toInsert = { ...toInsert, [respKey]: newResp };
            } else {
                toInsert = { ...toInsert, [respKey]: currentResp };
            }
        });
        // "toInsert" is after "all", because "toInsert" might contain an updated version of a respone in "all"
        return { ...all, ...toInsert };
    }, {});
    const allSlots = filesToProcess.reduce((all, { slots = {} }) => ({ ...slots, ...all }), {});
    const allForms = filesToProcess.reduce((all, { forms = {} }) => ({ ...forms, ...all }), {});
    const allAction = filesToProcess.reduce((all, { actions = [] }) => [...all, ...actions], []);
    const mergedActions = deduplicateArray(allAction); // we are not using a set to deduplicate to keep the order of the actions
    return {
        slots: allSlots,
        responses: allResponses,
        forms: allForms,
        actions: mergedActions,
    };
};

const validateADomain = (
    file,
    {
        defaultDomain = {}, projectLanguages = [], actionsFromFragments = [], fallbackLang,
    },
    // we validate domain and default domain with the same function
    // isDefaultDomain allow us to get the domain in rasaformat
    // and also triggers specific warning linked to default domain
    isDefaultDomain = false,
) => {
    const { rawText } = file;
    let domain;
    try {
        domain = safeLoad(rawText);
    } catch (e) {
        return {
            ...file,
            errors: [...(file?.errors || []), `Not valid yaml: ${e.message}`],
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
    const newLangsResponses = {};

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
                newLangsResponses[lang] = [...(newLangsResponses[lang] || []), key];
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
    if (Object.keys(newLangsResponses).length > 0) {
        Object.keys(newLangsResponses).forEach((lang) => {
            warnings.push({ text: `those reponses will add the support for the language ${lang} :`, longText: newLangsResponses[lang].join(', ') });
        });
    }
  
  
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

    const actionsWithoutResponses = actionsFromFile.filter(action => !(/^utter_/.test(action)));
    const actionNotInFragments = actionsWithoutResponses.filter(action => !actionsFromFragments.includes(action));

    if (actionNotInFragments && actionNotInFragments.length > 0 && !isDefaultDomain) {
        warnings.push({
            text: 'Some actions defined in this file will be added to the default domain on import',
            longText: 'the actions that will be added to the default domain are the one that are in this file and not used directly by the rules or stories',
        });
    }
    const newDomain = {
        slots: isDefaultDomain ? slotsFromFile : slots,
        bfForms,
        responses: isDefaultDomain ? responsesRasaFormat : responses,
        actions: isDefaultDomain ? actionsWithoutResponses : actionNotInFragments,
        forms: formsFromFile,
    };

    return {
        ...file,
        warnings: [...(file?.warnings || []), ...warnings],
        ...newDomain,
        newLanguages: Array.from(newLanguages),
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

    const defaultDomainValidFiles = onlyValidFiles(defaultDomainFiles);

    if (defaultDomainValidFiles.length === 0) {
        defaultDomain = safeLoad(
            Projects.findOne({ _id: projectId }).defaultDomain.content,
        );
    } else {
        defaultDomain = mergeDomainsRasaFormat(defaultDomainValidFiles);
    }
    const newSummary = params.summary;

    if (defaultDomainValidFiles.length > 0) {
        const nameList = defaultDomainValidFiles.map(file => file.filename).join(', ');
        newSummary.push(`The default domain will be replaced by ${nameList}`);
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
                    'You have multiple domain files. if some data conflicts, the one from the first file with that data will be used (same way has rasa merges domains)',
                ],
            };
        });
    }
   
    const newSummary = params.summary;
    let newLanguages = params.projectLanguages;
    const validDomainFiles = domainFiles.filter(file => !(file.errors && file.errors.length > 0));
    if (validDomainFiles.length > 0) {
        const newLangs = domainFiles.reduce((all, file) => [...(file.newLanguages || []), ...all], []);
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
        if (actionsLen > 0) tempSummary.push(`${actionsLen} actions (actions ends up in the default domain)`);
        newSummary.push(`From ${nameList} you will add: ${tempSummary.join(', ')}`);
        newSummary.push(...newLangs.map(lang => `Support for the lang '${lang}' will be added using the default config`));
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
