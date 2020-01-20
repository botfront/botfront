import { Stories } from '../../story/stories.collection';

export const getWebchatProps = async projectId => Stories.find(
    { projectId },
    { rules: true },
).fetch().reduce((result, option) => {
    if (option.rules) {
        return [...result, ...option.rules];
    }
    return result;
}, []);
