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
