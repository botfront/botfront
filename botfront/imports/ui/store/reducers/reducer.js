import { combineReducers } from 'redux';
import { Map as IMap } from 'immutable';

import * as types from '../actions/types';
import stories from './story.reducer';

/* eslint-disable indent */

const initialState = IMap({
    projectId: null,
    templatesTablePage: 0,
    templatesTableFilter: '',
    templatesTableShowMatching: false,
    workingDeploymentEnvironment: 'development',
    workingLanguage: null,
    workingDashboard: null,
    chatInitPayload: '/get_started',
    showChat: false,
    shouldRefreshChat: false,
    conversationFilters: null,
});

function settings(state = initialState, action) {
    switch (action.type) {
        case types.SET_PROJECT_ID:
            return state.set('projectId', action.projectId);
        case types.CHANGE_PAGE_TEMPLATES_TABLE:
            return state.set('templatesTablePage', action.page);
        case types.CHANGE_FILTER_TEMPLATES_TABLE:
            return state.set('templatesTableFilter', action.filter);
        case types.TOGGLE_MATCHING_TEMPLATES_TABLE:
            return state.set(
                'templatesTableShowMatching',
                !state.get('templatesTableShowMatching'),
            );
        case types.SET_WORKING_LANGUAGE:
            return state.set('workingLanguage', action.workingLanguage);
        case types.SET_WORKING_DEPLOYMENT_ENVIRONMENT:
            return state.set('workingDeploymentEnvironment', action.env);
        case types.SET_WORKING_DASHBOARD:
            return state.set('workingDashboard', action.dashboard);
        case types.SET_CHAT_INIT_PAYLOAD:
            return state.set('chatInitPayload', action.payload);
        case types.SET_SHOW_CHAT:
            return state.set('showChat', action.showChat);
        case types.SET_SHOULD_REFRESH_CHAT:
            return state.set('shouldRefreshChat', action.shouldRefreshChat);
        case types.SET_CONVERSATION_FILTERS:
            return state.set('conversationFilters', action.filters);
        default:
            return state;
    }
}

export default combineReducers({
    settings,
    stories,
});
