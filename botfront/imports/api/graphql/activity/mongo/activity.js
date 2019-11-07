import Activity from '../activity.model.js';


export const getActivities = async modelId => (Activity.find(
    {
        modelId,
    }, null,

).lean());
