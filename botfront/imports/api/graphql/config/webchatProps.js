import { Stories } from '../../story/stories.collection';

export const getWebchatRules = async (projectId, env = 'development') => {
    const status = env === 'development' ? {} : { status: 'published' };
    return Stories.find(
        { projectId, ...status },
        { rules: true },
    ).fetch().reduce((result, option) => {
        if (option.rules) {
            return [...result, ...option.rules];
        }
        return result;
    }, []);
};
