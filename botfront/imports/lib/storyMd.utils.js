export const getEntities = (storyLine) => {
    const entitiesString = storyLine.split('{')[1];
    if (!entitiesString) return [];
    const entities = entitiesString.slice(0, entitiesString.length - 1).split(',');
    return entities.map(entity => entity.split(':')[0].replace(/"/g, ''));
};

export const parsePayload = (payload) => {
    if (payload[0] !== '/') throw new Error('a payload must start with a "/"');
    const intent = payload.slice(1).split('{')[0];
    const entities = getEntities(payload.slice(1));
    return { intent, entities };
};

export const parseLine = (line) => {
    const prefix = line.trim()[0];
    const content = line.trim().slice(1).trim();
    let type = null;
    let entities;
    let name = content;
    switch (prefix) {
    case '*':
        type = 'user';
        name = content.split('{')[0].replace(/"/g, '');
        entities = getEntities(line);
        break;
    case '-':
        if (/^utter_/.test(content)) {
            type = 'bot';
        } else if (/^slot/.test(content)) {
            type = 'slot';
            name = content.split('{')[1].split(':')[0].replace(/"/g, '');
        } else if (/^action_/.test(content)) {
            type = 'action';
        } else if (/_form$/.test(content) || /^form{"/.test(content)) {
            type = 'form';
        }
        break;
    default:
        type = null;
    }
    return { type, name, entities };
};

export const parseStory = (story) => {
    const storyContent = {
        botResponses: [],
        userUtterances: [],
        slots: [],
        actions: [],
        forms: [],
    };
    const lines = story ? story.split('\n') : [];
    lines.forEach((line) => {
        const { type, ...rest } = parseLine(line);
        switch (type) {
        case null: break;
        case 'user':
            storyContent.userUtterances.push(rest);
            break;
        case 'bot':
            storyContent.botResponses.push(rest.name);
            break;
        case 'action':
            storyContent.actions.push(rest.name);
            break;
        case 'slot':
            storyContent.slots.push(rest.name);
            break;
        case 'form':
            storyContent.forms.push(rest.name);
            break;
        default: break;
        }
    });
    return storyContent;
};

export const parseStoryTree = (incomingStory, options) => {
    const { update = {} } = options;
    const story = incomingStory._id === update._id
        ? { ...incomingStory, ...update }
        : incomingStory;
    let {
        botResponses, userUtterances, slots, actions, forms,
    } = parseStory(story.story);
    let md = story.story;
    if (story.branches && story.branches.length > 0) {
        story.branches.forEach((childStory) => {
            const events = parseStoryTree(childStory, options);
            md = `${md}${story.story}`;
            botResponses = [...botResponses, ...events.botResponses];
            userUtterances = [...userUtterances, ...events.userUtterances];
            slots = [...slots, ...events.slots];
            actions = [...actions, ...events.actions];
            forms = [...forms, ...events.forms];
        });
    }
    return {
        botResponses, userUtterances, slots, actions, forms, md,
    };
};

export const getStoryContent = (story, options) => {
    if (typeof story === 'string') {
        return parseStoryTree(story, options);
    } if (typeof story === 'object') {
        return parseStoryTree(story, options);
    }
    return {};
};
