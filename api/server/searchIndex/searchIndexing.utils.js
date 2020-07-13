const { Responses, Stories } = require('../../models/models');
const { safeDump } = require('js-yaml/lib/js-yaml');
const { safeLoad } = require('js-yaml');

const getEntities = (storyLine) => {
    const entitiesString = storyLine.split('{')[1];
    if (!entitiesString) return [];
    const entities = entitiesString.slice(0, entitiesString.length - 1).split(',');
    return entities.map(entity => entity.split(':')[0].replace(/"/g, ''));
};

const parsePayload = (payload) => {
    if (payload[0] !== '/') throw new Error('a payload must start with a "/"');
    const intent = payload.slice(1).split('{')[0];
    const entities = getEntities(payload.slice(1));
    return { intent, entities };
};

const indexResponseContent = ({ text = '', custom = null, buttons = [] }) => {
    const responseContent = [];
    if (text.length > 0) responseContent.push(text.replace(/\n/, ' '));
    if (custom) responseContent.push(safeDump(custom).replace(/\n/, ' '));
    buttons.forEach(({ title = '', payload = '', url = '' }) => {
        if (title.length > 0) responseContent.push(title);
        if (payload.length > 0 && payload[0] === '/') {
            const { intent, entities } = parsePayload(payload);
            responseContent.push(intent);
            entities.forEach(entity => responseContent.push(entity));
        }
        if (url.length > 0) responseContent.push(url);
    });
    return responseContent;
};

const indexBotResponse = (response) => {
    let responseContent = [];
    responseContent.push(response.key);
    response.values.forEach((value) => {
        value.sequence.forEach((sequence) => {
            responseContent = [...responseContent, ...indexResponseContent(safeLoad(sequence.content))];
        });
    });
    return responseContent.join('\n');
};

const createResponsesIndex = async (projectId, responses) => {
    const newResponses = typeof responses === 'string' ? JSON.parse(responses) : responses;
    // eslint-disable-next-line array-callback-return
    const answer = newResponses.map((newResponse) => {
        const properResponse = newResponse;
        properResponse.projectId = projectId;
        properResponse.textIndex = indexBotResponse(newResponse);
        return Responses.update({ projectId, key: newResponse.key }, properResponse, { upsert: true });
    });
    return Promise.all(answer);
};

const parseLine = (line) => {
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
        }
        break;
    default:
        type = null;
    }
    return { type, name, entities };
};

const parseStory = (story) => {
    const storyContent = {
        botResponses: [],
        userUtterances: [],
        slots: [],
        actions: [],
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
        default: break;
        }
    });
    return storyContent;
};

const parseStoryTree = (incomingStory, options) => {
    const { update = {} } = options;
    const story = incomingStory._id === update._id
        ? { ...incomingStory, ...update }
        : incomingStory;
    let {
        botResponses, userUtterances, slots, actions,
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
        });
    }
    return {
        botResponses, userUtterances, slots, actions, md,
    };
};

const getStoryContent = (story, options) => {
    if (typeof story === 'string') {
        return parseStoryTree(story, options);
    } if (typeof story === 'object') {
        return parseStoryTree(story, options);
    }
    return {};
};

const indexStory = (story) => {
    const {
        userUtterances = [], botResponses = [], actions = [], slots = [],
    } = getStoryContent(story,{});
    const storyContentIndex = [
        ...userUtterances.map(({ name, entities }) => {
            const utteranceIndex = [name];
            entities.forEach(entity => utteranceIndex.push(entity));
            return utteranceIndex.join(' ');
        }),
        ...botResponses,
        ...actions,
        ...slots,
    ].join(' \n ');
    const result = { contents: storyContentIndex, info: story.title };
    return result;
};

const createStoriesIndex = async (projectId, stories) => {
    const newStories = typeof stories === 'string' ? JSON.parse(stories) : stories;
    // eslint-disable-next-line array-callback-return
    const answer = newStories.map((story) => {
        story.textIndex = indexStory(story);
        return Stories.update({ projectId, _id: story._id }, story, { upsert: true });
    });
    return Promise.all(answer);
};

exports.createStoriesIndex = createStoriesIndex;
exports.indexStory = indexStory;
exports.createResponsesIndex = createResponsesIndex;
exports.indexBotResponse = indexBotResponse;