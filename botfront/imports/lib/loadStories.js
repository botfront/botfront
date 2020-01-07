const splitBody = (lines) => {
    const header = [];
    const body = [];
    const footer = [];
    lines.forEach((line) => {
        if (line.startsWith('>')) {
            const cleanLine = line.replace(/^> */, '').trim();
            if (!body.length) header.push(cleanLine);
            else footer.push(cleanLine);
        } else if (footer.length) throw new Error('a checkpoint sandwiched between other content: bad form');
        else body.push(line);
    });
    return { header, body: body.join('\n'), footer };
};

const checkHeader = (header, fullTitle) => {
    let ancestorOf = [];
    const linkFrom = [];
    header.forEach((origin) => {
        const motherFromCheckpoint = (origin.match(/(.*)__branches/) || [])[1];
        const motherFromTitle = (fullTitle.replace(/ /g, '_').match(/(.*)__.*/) || [])[1];
        if (motherFromCheckpoint || motherFromTitle) {
            if (motherFromCheckpoint !== motherFromTitle) throw new Error('branching convention not respected!');
            if (ancestorOf.length) throw new Error('multiple mothers!');
            ancestorOf = motherFromCheckpoint.split('__');
        } else {
            linkFrom.push(origin);
        }
    });
    return { ancestorOf, linkFrom };
};

const checkFooter = (footer, fullTitle) => {
    let hasDescendents = false;
    let linkTo = null;
    if (!footer.length) return { hasDescendents, linkTo };
    if (footer.length > 1) throw new Error('story can\'t link to more than one destination');
    const branchingCheckpoint = (footer[0].match(/(.*)__branches/) || [])[1];
    if (branchingCheckpoint && branchingCheckpoint !== fullTitle.replace(/ /g, '_')) {
        throw new Error(`branching convention not respected! -- ${branchingCheckpoint} -- ${fullTitle.replace(/ /g, '_')}`);
    }
    if (branchingCheckpoint) hasDescendents = true;
    else [linkTo] = footer;
    return { hasDescendents, linkTo };
};

const parseStory = (storyGroupName, fullTitle, lines) => {
    const title = (fullTitle.match(/.*__(.*)/) || [null, fullTitle])[1];
    try {
        const { header, body, footer } = splitBody(lines);
        const { ancestorOf, linkFrom } = checkHeader(header, fullTitle);
        const { hasDescendents, linkTo } = checkFooter(footer, fullTitle);
        return {
            storyGroupName, title, fullTitle, ancestorOf, linkFrom, hasDescendents, linkTo, body,
        };
    } catch (error) {
        return {
            storyGroupName, title, fullTitle, rawText: lines.join('\n'), error,
        };
    }
};

export const parseStoryGroup = (storyGroupName, rawText) => `\n${rawText}`.split('\n## ')
    .filter(s => s.trim())
    .map((s) => {
        const [fullTitle, ...lines] = s.replace(/ *<!--.*--> *\n?/gs, '').split('\n');
        return parseStory(storyGroupName, fullTitle, lines);
    });
