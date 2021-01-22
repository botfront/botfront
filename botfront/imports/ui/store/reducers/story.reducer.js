import { Map as IMap, List as IList } from 'immutable';
import * as types from '../actions/types';

const initialState = IMap({
    storyMode: 'visual',
    storiesCurrent: IList(),
    savedStoryPaths: IMap(),
});

export default function reducer(state = initialState, action) {
    switch (action.type) {
    case types.SET_STORIES_CURRENT:
        return state.set('storiesCurrent', IList(action.storyIds));
    case types.SET_STORY_MODE:
        return state.set('storyMode', action.mode);
    case types.SET_STORY_PATH:
        return state.setIn(['savedStoryPaths', action.storyId], IList(action.path));
    default:
        return state;
    }
}
