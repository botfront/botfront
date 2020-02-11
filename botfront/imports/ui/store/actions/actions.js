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

export function setStoryGroup(groupIndex) {
    return {
        type: types.SET_STORY_GROUP,
        groupIndex,
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

export function setWorkingDeploymentEnvironment(env) {
    return {
        type: types.SET_WORKING_DEPLOYMENT_ENVIRONMENT,
        env,
    };
}

export function swapAnalyticsCards(k1, k2) {
    return {
        type: types.SWAP_ANALYTICS_CARDS,
        k1,
        k2,
    };
}

export function setAnalyticsCardSettings(cardId, setting, value) {
    return {
        type: types.SET_ANALYTICS_CARD_SETTINGS,
        cardId,
        setting,
        value,
    };
}

export function setAnalyticsLanguages(languages) {
    return {
        type: types.SET_ANALYTICS_LANGUAGES,
        languages,
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
