import { Stories } from './stories.collection';
import { getStoryContent } from '../../lib/storyMd.utils';

export const indexStory = (storyToIndex, options = {}) => {
    /* options is an object with optional properties:

        update: Object (optional), is combined with the
                story or branch object using {...story/branch, ...update}
                when update._id equals branch._id or story._id

        includeEventsField: Bool (optional) adds a list of all
                bot responses and actions to the object returned by
                this function.
                used to update the Story collection "events" field
    */
    const { includeEventsField, update = {} } = options;
    const story = typeof storyToIndex === 'string'
        ? Stories.findOne({ _id: storyToIndex })
        : storyToIndex;
    const {
        userUtterances = [], botResponses = [], actions = [], slots = [], forms = [],
    } = getStoryContent(story, options);
    const storyContentIndex = [
        ...userUtterances.map(({ name, entities }) => {
            const utteranceIndex = [name];
            entities.forEach(entity => utteranceIndex.push(entity));
            return utteranceIndex.join(' ');
        }),
        ...botResponses,
        ...actions,
        ...slots,
        ...forms,
    ].join(' \n ');
    const result = {};
    result.textIndex = { contents: storyContentIndex, info: update.title || story.title };
    if (includeEventsField) {
        const events = Array.from(new Set([...botResponses, ...actions]));
        result.events = events;
    }
    return result;
};
