import yaml from 'js-yaml';
import { update } from './common';

export const addBotfrontConfig = ({
    f, rawText, setFileList,
}) => {
    const errors = [];
    const bfConfig = yaml.safeLoad(rawText);
    Object.keys(bfConfig).forEach((key) => {
        if (!['project', 'instance'].includes(key)) {
            errors.push(`${key} is not valid botfront data`);
        }
    });
    if (errors.length > 0) {
        return update(setFileList, f, { dataType: 'bfconfig', errors });
    }
    return update(setFileList, f, { dataType: 'bfconfig', rawText, ...bfConfig });
};
