import { Stories } from '../../story/stories.collection';

export const getWebchatProps = async projectId => Stories.find(
    { projectId },
    { triggerRules: true },
).fetch().reduce((result, option) => {
    if (option.triggerRules) {
        return [...result, ...option.triggerRules];
    }
    return result;
}, []);
