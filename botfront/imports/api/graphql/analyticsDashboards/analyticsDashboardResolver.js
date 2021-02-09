import AnalyticsDashboard from './analyticsDashboards.model.js';
import { checkIfCan } from '../../../lib/scopes';

export default {
    Query: {
        listDashboards: async (_root, { projectId, _id }, context) => {
            checkIfCan('analytics:r', projectId, context.user._id);
            return AnalyticsDashboard.find({ projectId, ...(_id ? { _id } : {}) });
        },
    },

    Mutation: {
        updateDashboard: async (_root, { projectId, _id, ...rest }, context) => {
            checkIfCan('analytics:w', projectId, context.user._id);
            return AnalyticsDashboard.findOneAndUpdate(
                { projectId, _id },
                { $set: rest },
                { new: true, lean: true },
            ).exec();
        },
    },

    AnalyticsDashboard: {
        _id: ({ _id }) => _id,
        name: ({ name }) => name,
        projectId: ({ projectId }) => projectId,
        cards: ({ cards }) => cards,
        languages: ({ languages }) => languages,
        envs: ({ envs }) => envs,
    },

    AnalyticsCard: {
        name: ({ name }) => name,
        description: ({ description }) => description,
        type: ({ type }) => type,
        visible: ({ visible }) => visible,
        startDate: ({ startDate }) => startDate,
        endDate: ({ endDate }) => endDate,
        chartType: ({ chartType }) => chartType,
        valueType: ({ valueType }) => valueType,
        includeActions: ({ includeActions }) => includeActions,
        excludeActions: ({ excludeActions }) => excludeActions,
        includeIntents: ({ includeIntents }) => includeIntents,
        excludeIntents: ({ excludeIntents }) => excludeIntents,
        selectedSequence: ({ selectedSequence }) => selectedSequence,
        wide: ({ wide }) => wide,
        showDenominator: ({ showDenominator }) => showDenominator,
    },
};
