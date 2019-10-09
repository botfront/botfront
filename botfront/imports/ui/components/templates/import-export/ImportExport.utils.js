export const getRequestOptions = (apiHost, path) => {
    const splitUrl = apiHost.split(':');
    const options = {
        hostname: splitUrl[1].slice(2),
        port: splitUrl[2],
        path,
        connection: 'keep-alive',
        localAddress: '127.0.0.1',
        method: 'GET',
        protovol: splitUrl[0],
    };
    return options;
};

export const generateErrorText = (error) => {
    let errorText;
    if (error.code === 'ENOTFOUND') {
        errorText = 'The botfront API was not found. Please verify your api url host setting is correct';
    } else {
        errorText = `Error code: ${error.code}`;
    }
    return errorText;
};
