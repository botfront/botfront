import { update } from './common';

export const addIncoming = ({
    f, rawText, setFileList,
}) => {
    const incoming = JSON.parse(rawText);
   
    if (!Array.isArray(incoming) || incoming.length < 1) {
        return update(setFileList, f, { dataType: 'incoming', warnings: 'There are no incoming in this file' });
    }
    return update(setFileList, f, { dataType: 'incoming', rawText, incoming });
};
