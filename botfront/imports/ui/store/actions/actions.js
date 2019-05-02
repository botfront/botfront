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
