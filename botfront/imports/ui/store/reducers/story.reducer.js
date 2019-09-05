import { Map, List } from 'immutable';
import * as types from '../actions/types';

const initialState = Map({
    storyMode: 'markdown',
    storyGroupCurrent: -1,
    savedStoryPaths: Map(),
    storiesCollapsed: Map(),
});

export default function reducer(state = initialState, action) {
    switch (action.type) {
    case types.SET_STORY_GROUP:
        return state.set('storyGroupCurrent', action.groupIndex);
    case types.SET_STORY_MODE:
        return state.set('storyMode', action.mode);
    case types.SET_STORY_PATH:
        return state.setIn(['savedStoryPaths', action.storyId], List(action.path));
    case types.SET_STORY_COLLAPSED:
        return state.setIn(['storiesCollapsed', action.storyId], action.collapsed);
    default:
        return state;
    }
}
