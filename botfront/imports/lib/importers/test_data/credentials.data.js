export const validCredentials = {
    filename: 'credentialstest.yml',
    rawText: 'rasa_addons.core.channels.webchat.WebchatInput:\n        session_persistence: true\n        base_url: \'http://localhost:5005\'\n        socket_path: /socket.io/',
    dataType: 'credentials',
};

export const validCredentialsParsed = {
    'rasa_addons.core.channels.webchat.WebchatInput': {
        base_url: 'http://localhost:5005',
        session_persistence: true,
        socket_path: '/socket.io/',
    },
};
