import { Stories } from '../../story/stories.collection';

export const getWebchatRules = async (projectId, env = 'development') => {
    const status = env === 'development' ? {} : { status: 'published' };
    return Stories.find({ projectId, ...status }, { rules: true, triggerIntent: true })
        .fetch()
        .reduce(
            (result, { rules = [], triggerIntent } = {}) => [
                ...result,
                ...rules.map(r => ({ ...r, payload: triggerIntent[0] === '/' ? triggerIntent : `/${triggerIntent}` })),
            ],
            [],
        );
};
