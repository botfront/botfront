/* eslint-disable camelcase */

export const updateIncomingPath = (params, exitBefore) => {
    const {
        project_id, tab, page, selected_id,
    } = params;
    let path = '/project';
    if (!project_id) {
        return path;
    }
    path = `${path}/${project_id}/incoming`;
    if (!tab || exitBefore === 'tab') {
        return path;
    }
    path = `${path}/${tab}`;
    if (!page || exitBefore === 'page') {
        return path;
    }
    path = `${path}/${page}`;
    if (!selected_id || exitBefore === 'selected_id') {
        return path;
    }
    path = `${path}/${selected_id}`;
    return path;
};
