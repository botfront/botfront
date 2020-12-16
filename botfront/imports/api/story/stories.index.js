import { Stories } from './stories.collection';

const RESERVED_KEYS = [
    '_id',
    'branches',
    'steps',
    'condition',
    'title',
    'intent',
    'entities',
    'user',
    'action',
    'slot_was_set',
    'or',
    'active_loop',
];

const scrapeStoryTextAndActions = (el) => {
    if (Array.isArray(el)) return el.flatMap(scrapeStoryTextAndActions);
    if (el && typeof el === 'object') {
        return Object.keys(el).flatMap(k => [
            ...(!RESERVED_KEYS.includes(k) ? [{ type: 'other', value: k }] : []),
            ...(typeof el[k] === 'string'
                ? k === 'action'
                    ? [{ type: 'action', value: el[k] }]
                    : [{ type: 'other', value: el[k] }]
                : scrapeStoryTextAndActions(el[k])),
        ]);
    }
    return [];
};

export const indexStory = (storyToIndex, options = {}) => {
    /* options is an object with optional properties:

        update: Object (optional), is combined with the
                story or branch object using {...story/branch, ...update}
                when update._id equals branch._id or story._id
    */
    const { update = {} } = options;
    const storyPreupdate = typeof storyToIndex === 'string'
        ? Stories.findOne({ _id: storyToIndex })
        : storyToIndex;
    const story = storyPreupdate._id === update._id
        ? { ...storyPreupdate, ...update }
        : storyPreupdate;
    const {
        title, steps, condition, branches,
    } = story;
    const els = scrapeStoryTextAndActions([title, condition, steps, branches]);
    const result = {};
    result.textIndex = els.map(el => el.value).join(' ');
    const events = Array.from(
        new Set(els.filter(el => el.type === 'action').map(el => el.value)),
    );
    result.events = events;
    return result;
};
