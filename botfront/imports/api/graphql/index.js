import { mergeTypeDefs } from '@graphql-tools/merge';
import conversationResolvers from './conversations/resolvers';
import conversationTypes from './conversations/schemas';
import activityResolver from './activity/resolvers/activityResolver';
import activityTypes from './activity/schemas';
import commonResolver from './common/commonResolver';
import commonTypes from './common/common.types.graphql';
import botResponsesResolvers from './botResponses/resolvers';
import botResponsesTypes from './botResponses/schemas';
import configResolver from './config/configResolver';
import configTypes from './config/config.types.graphql';
import formResolver from './forms/formResolver';
import formTypes from './forms/forms.types.graphql';
import nluResolvers from './nlu/resolvers';
import nluTypes from './nlu/schemas';
import storiesTypes from './story/schemas/stories.types.graphql';
import storiesResolver from './story/resolvers/storiesResolver';
import rolesDataTypes from './rolesData/schemas';
import rolesDataResolver from './rolesData/resolvers/rolesDataResolver';
import trackerStoreResolver from './trackerStore/resolvers/trackerStoreResolver';
import trackerStoreTypes from './trackerStore/schemas';
import analyticsDashboardResolver from './analyticsDashboards/analyticsDashboardResolver';
import analyticsDashboardTypes from './analyticsDashboards/analyticsDashboards.types.graphql';


export const resolvers = [
    ...conversationResolvers,
    ...nluResolvers,
    ...botResponsesResolvers,
    ...nluResolvers,
    rolesDataResolver,
    activityResolver,
    commonResolver,
    configResolver,
    formResolver,
    storiesResolver,
    trackerStoreResolver,
    analyticsDashboardResolver,
];

export const typeDefs = mergeTypeDefs([
    ...conversationTypes,
    ...botResponsesTypes,
    ...nluTypes,
    ...activityTypes,
    ...nluTypes,
    ...rolesDataTypes,
    ...trackerStoreTypes,
    commonTypes,
    configTypes,
    formTypes,
    storiesTypes,
    analyticsDashboardTypes,
], { all: true });

export const schemaDirectives = {};
