import { languages } from '../languages';
import { update } from './common';

export const getLanguage = (rawText, fallbackImportLanguage) => {
    const languageFromFirstLine = (rawText.split('\n', 1)[0].match(/^#[^#]lang:(.*)/)
        || [])[1];
    return Object.keys(languages).includes(languageFromFirstLine)
        ? languageFromFirstLine
        : fallbackImportLanguage;
};

const getCanonical = (rawText) => {
    const start = rawText.split('# canonical')[1] || '';
    const canonicalAndEnd = start.split('\n\n');
    const canonical = canonicalAndEnd.length > 1 ? canonicalAndEnd[0] : '';
    return canonical.split('\n- ');
};

export const addNluFile = ({
    f, rawText, setFileList, projectLanguages, fallbackImportLanguage, instanceHost,
}) => {
    const language = getLanguage(rawText, fallbackImportLanguage);
    if (!projectLanguages.includes(language)) {
        return update(setFileList, f, {
            errors: [
                `NLU dataset detected for language ${language}, but no such language used by project.`,
            ],
        });
    }
    const canonical = getCanonical(rawText);

    Meteor.call(
        'rasa.convertToJson',
        rawText,
        language,
        'json',
        instanceHost,
        (err, res) => {
            if (err || !res.data || !res.data.rasa_nlu_data) {
                return update(setFileList, f, {
                    errors: [`File could not be parsed by Rasa at ${instanceHost}.`],
                });
            }
            const { rasa_nlu_data: data } = res.data;
            delete data.lookup_tables; // to do: gazette from look up tables,
            // caveat: conversion route can't be used since tables are found in external text files
            return update(setFileList, f, {
                dataType: 'nlu',
                language,
                rasa_nlu_data: data,
                canonical,
            });
        },
    );
    return update(setFileList, f, {
        dataType: 'nlu',
        language,
        rawText,
        canonical,
    });
};
