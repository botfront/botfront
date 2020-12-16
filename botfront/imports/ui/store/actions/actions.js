import * as types from './types';

export function changePageTemplatesTable(page) {
    return {
        type: types.CHANGE_PAGE_TEMPLATES_TABLE,
        page,
    };
}

export function toggleMatchingTemplatesTable() {
    return {
        type: types.TOGGLE_MATCHING_TEMPLATES_TABLE,
    };
}

export function setProjectId(projectId) {
    return {
        type: types.SET_PROJECT_ID,
        projectId,
    };
}

export function changeFilterTemplatesTable(filter) {
    return {
        type: types.CHANGE_FILTER_TEMPLATES_TABLE,
        filter,
    };
}

export function setWorkingLanguage(workingLanguage) {
    return {
        type: types.SET_WORKING_LANGUAGE,
        workingLanguage,
    };
}

export function setStoryMode(mode) {
    return {
        type: types.SET_STORY_MODE,
        mode,
    };
}

export function setStoriesCurrent(storyIds) {
    return {
        type: types.SET_STORIES_CURRENT,
        storyIds,
    };
}

export function setStoryPath(storyId, path) {
    return {
        type: types.SET_STORY_PATH,
        storyId,
        path,
    };
}

export function setStoryCollapsed(storyId, collapsed) {
    return {
        type: types.SET_STORY_COLLAPSED,
        storyId,
        collapsed,
    };
}

export function setChatInitPayload (payload) {
    return {
        type: types.SET_CHAT_INIT_PAYLOAD,
        payload,
    };
}

export function setShowChat (showChat) {
    return {
        type: types.SET_SHOW_CHAT,
        showChat,
    };
}

export function setShouldRefreshChat (shouldRefreshChat) {
    return {
        type: types.SET_SHOULD_REFRESH_CHAT,
        shouldRefreshChat,
    };
}
