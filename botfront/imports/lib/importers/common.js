import JSZIP from 'jszip';


export const base = f => ({ filename: f.name, name: f.name, lastModified: f.lastModified });

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
    const { dataType, name } = f;
    try {
        if (dataType) return dataType;
        if (name === 'botfront-config.yml') return 'bfconfig';
        if ((/^config-[a-z]{2}.yml$/.test(name))) return 'rasaconfig';
        if ((/^endpoints(\.[a-z]+)?.yml$/.test(name))) return 'endpoints';
        if ((/^credentials(\.[a-z]+)?.yml$/.test(name))) return 'credentials';
        if (name === 'domain.yml') return 'domain';
        if (name.match(/\.md$/) && rawText.match(/## (?:intent|synonym|gazette|regex):/)) { return 'nlu'; } // need to be checked
        if (name.match(/\.md$/)) return 'stories'; // need to be checked
        if (name.match(/\.json$/)) {
            const data = JSON.parse(rawText);
            if ('rasa_nlu_data' in data) return 'nlu'; // need to be checked
            if (Array.isArray(data) && data.length > 0) {
                // might need improving at some point
                if (data[0].tracker) return 'conversations';
                if (data[0].text) return 'incoming';
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
