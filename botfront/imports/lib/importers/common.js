import JSZIP from 'jszip';
import yaml from 'js-yaml';

export const base = (f) => {
    const newfile = new File([f], f.name);
    return newfile;
};

export const update = (updater, file, content) => updater({
    update: {
        ...base(file),
        ...content,
    },
});

export const findFileInFileList = (fileList, file) => fileList.findIndex(
    cf => cf.filename === file.filename && cf.lastModified === file.lastModified,
);

export const updateAtIndex = (fileList, index, content) => [
    ...fileList.slice(0, index),
    { ...fileList[index], ...content },
    ...fileList.slice(index + 1),
];

export const deleteAtIndex = (fileList, index) => [
    ...fileList.slice(0, index),
    ...fileList.slice(index + 1),
];

export const determineDataType = (f, rawText) => {
    const { dataType, filename } = f;
    try {
        if (dataType) return dataType;
        if (filename === 'botfront-config.yml') return 'bfconfig';
        if ((/^config(-[a-z]+)?.yml$/.test(filename))) return 'rasaconfig';
        if ((/^endpoints(\.[a-z]+)?.yml$/.test(filename))) return 'endpoints';
        if ((/^credentials(\.[a-z]+)?.yml$/.test(filename))) return 'credentials';
        if (filename === 'domain.yml') return 'domain';
        if (filename.match(/\.json$/)) {
            const data = JSON.parse(rawText);
            if ('rasa_nlu_data' in data) return 'nlu'; // need to be checked
            if (Array.isArray(data) && data.length > 0) {
                // might need improving at some point
                if (data[0].tracker) return 'conversations';
                if (data[0].text) return 'incoming';
            }
        }
        if (filename.match(/\.yml$/)) {
            const data = yaml.safeLoad(rawText);
            const domainKeys = ['responses', 'templates', 'actions', 'session_config', 'slots'];
            const trainingKeys = ['version', 'nlu', 'stories', 'rules'];
          
            if (Object.keys(data).some(key => domainKeys.includes(key))) {
                return 'domain';
            }
            if (Object.keys(data).some(key => trainingKeys.includes(key))) {
                return 'rasatrainingdata';
            }
        }
        return 'unknown';
    } catch (e) {
        console.log(e);
        return 'unknown';
    }
};


export const unZipFile = async (f) => {
    const zip = new JSZIP();
    const loadedZip = await zip.loadAsync(f);
  
    const files = await Promise.all(Object.keys(loadedZip.files).map(async (filename) => {
        const fileData = await loadedZip.files[filename].async('blob');
        if ((/([a-z-0-9]+\/)+$/).test(filename)) { // this regex detect folder in the shape of aa/bbb/
            return null; // we don't want folders in the file array
        }
        return new File([fileData], filename.replace(/([a-z-0-9]+\/)+/, '')); // keep only the name of the file ditch the path part
    }));
    return files.filter(file => file !== null);
};
