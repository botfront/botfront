export const formatRoles = (userRoles, project) => ({ roles: [{ roles: userRoles, project }] });

export const roles = [
    'nlu-data:r',
    'nlu-data:w',
    'nlu-data:x',
    'responses:r',
    'responses:w',
    'stories:r',
    'stories:w',
    'triggers:r',
    'triggers:w',
    'incoming:r',
    'incoming:w',
    'analytics:r',
    'projects:r',
    'projects:w',
    'global-settings:r',
    'global-settings:w',
    'roles:r',
    'roles:w',
    'users:r',
    'users:w',
    'global-admin',
];

export const readers = {
    nluData: [
        'nlu-data:r',
        'nlu-data:w',
        'stories:r',
        'stories:w',
        'triggers:r',
        'triggers:w',
        'incoming:r',
        'incoming:w',
        'analytics:r',
        'global-admin',
        'projects:w',
        'projects:r',
    ],
    responses: [
        'responses:r',
        'responses:w',
        'stories:r',
        'stories:w',
        'triggers:r',
        'triggers:w',
        'incoming:r',
        'incoming:w',
        'analytics:r',
        'global-admin',
        'projects:w',
        'projects:r',
    ],
    incoming: [
        'incoming:r',
        'incoming:w',
        'analytics:r',
        'global-admin',
        'projects:w',
        'projects:r',
    ],
    analytics: [
        'analytics:r',
        'global-admin',
        'projects:w',
        'projects:r',
    ],
    projects: [
        'projects:w',
        'projects:r',
        'global-admin',
    ],
    stories: [
        'stories:r',
        'stories:w',
        'triggers:r',
        'triggers:w',
        'incoming:r',
        'incoming:w',
        'analytics:r',
        'global-admin',
        'projects:w',
        'projects:r',
    ],
    roles: [
        'roles:r',
        'roles:w',
        'users:w',
        'global-admin',
    ],
    users: [
        'users:r',
        'users:w',
        'global-admin',
    ],
    globalSettings: [
        'global-settings:w',
        'global-settings:r',
        'global-admin',
    ],
};

export const writers = {
    nluData: [
        'nlu-data:w',
        'incoming:w',
        'global-admin',
    ],
    responses: [
        'responses:w',
        'global-admin',
    ],
    analytics: [
        'incoming:w',
        'global-admin',
    ],
    activity: [
        'nlu-data:w',
        'nlu-data:w',
        'incoming:w',
        'global-admin',
    ],
    incoming: [
        'incoming:w',
        'global-admin',
    ],
    roles: [
        'roles:w',
        'global-admin',
    ],
    projects: [
        'projects:w',
        'global-admin',
    ],
    globalSettings: [
        'global-settings:w',
        'global-admin',
    ],
    stories: [
        'stories:w',
        'global-admin',
    ],
    triggers: [
        'triggers:w',
        'global-admin',
    ],
    users: [
        'users:w',
        'global-admin',
    ],
};

export const otherRoles = {
    nluDataX: [
        'nlu-data:x',
        'global-admin',
    ],
};
