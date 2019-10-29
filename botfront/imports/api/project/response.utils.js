import { dump as yamlDump, safeLoad as yamlLoad } from 'js-yaml';

export const formatNewlines = (sequence) => {
    const regexSpacedNewline = / {2}\n/g;
    const regexNewline = /\n/g;
    const updatedSequence = sequence.map(({ content: contentYaml }) => {
        const content = yamlLoad(contentYaml);
        content.text = content.text
            .replace(regexSpacedNewline, '\n')
            .replace(regexNewline, '  \n');
        return { content: yamlDump({ ...content }) };
    });
    return updatedSequence;
};

export const formatTextOnSave = (values) => {
    return values.map(item => {
        const updatedItem = item;
        item.sequence = formatNewlines(item.sequence)
        return updatedItem
    })
} 