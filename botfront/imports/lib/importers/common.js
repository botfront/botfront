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
    if (dataType) return dataType;
    if (name === 'domain.yml') return 'domain';
    if (name.match(/\.json$/) && 'rasa_nlu_data' in JSON.parse(rawText)) return 'nlu';
    if (name.match(/\.md$/) && rawText.match(/## (?:intent|synonym|gazette|regex):/)) { return 'nlu'; }
    if (name.match(/\.md$/)) return 'stories';
    return 'unknown';
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
