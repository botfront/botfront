import yaml from 'js-yaml';

import { update } from './common';

export const addCredentials = ({
    f, rawText, setFileList,
}) => {
    let credentials;
    try {
        credentials = yaml.safeLoad(rawText);
    } catch (e) {
        return update(setFileList, f, { dataType: 'credentials', errors: ['Not valid yaml'] });
    }
    return update(setFileList, f, { dataType: 'credentials', rawText, credentials });
};
