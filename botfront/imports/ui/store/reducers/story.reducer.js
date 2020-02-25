import { Map as IMap, List as IList } from 'immutable';
import * as types from '../actions/types';

const initialState = IMap({
    storyMode: 'visual',
    storyGroupCurrent: 0,
    savedStoryPaths: IMap(),
    storiesCollapsed: IMap(),
});

export default function reducer(state = initialState, action) {
    switch (action.type) {
    case types.SET_STORY_GROUP:
        return state.set('storyGroupCurrent', action.groupIndex);
    case types.SET_STORY_MODE:
        return state.set('storyMode', action.mode);
    case types.SET_STORY_PATH:
        return state.setIn(['savedStoryPaths', action.storyId], IList(action.path));
    case types.SET_STORY_COLLAPSED:
        return state.setIn(['storiesCollapsed', action.storyId], action.collapsed);
    case types.SET_STORIES_COLLAPSED:
        return state.mergeIn(['storiesCollapsed'], action.stories);
    default:
        return state;
    }
}
