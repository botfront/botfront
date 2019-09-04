import { Map, List } from 'immutable';
import * as types from '../actions/types';

/* eslint-disable indent */

const initialState = Map({
    projectId: null,
    templatesTablePage: 0,
    templatesTableFilter: '',
    templatesTableShowMatching: false,
    workingLanguage: 'en',
    storyMode: 'visual',
    storyGroupCurrent: -1,
    savedStoryPaths: Map(),
});

export default function reducer(state = initialState, action) {
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
        case types.SET_STORY_GROUP:
            return state.set('storyGroupCurrent', action.groupIndex);
        case types.SET_STORY_MODE:
            return state.set('storyMode', action.mode);
        case types.SET_STORY_PATH:
            return state.setIn(['savedStoryPaths', action.storyId], List(action.path));
        default:
            return state;
    }
}
