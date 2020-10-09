import yaml from 'js-yaml';

import { update } from './common';

export const addEndpoints = ({
    f, rawText, setFileList,
}) => {
    let endpoints;
    try {
        endpoints = yaml.safeLoad(rawText);
    } catch (e) {
        return update(setFileList, f, { dataType: 'endpoints', errors: ['Not valid yaml'] });
    }
    return update(setFileList, f, { dataType: 'endpoints', rawText, endpoints });
};
