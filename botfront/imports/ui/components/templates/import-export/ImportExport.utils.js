export const getRequestOptions = (apiHost, path, method, headers) => {
    const splitUrl = apiHost.split(':');
    const options = {
        hostname: splitUrl[1].slice(2),
        port: splitUrl[2],
        path,
        connection: 'keep-alive',
        localAddress: '127.0.0.1',
        method,
        protovol: splitUrl[0],
    };
    if (method === 'PUT') {
        options.headers = headers;
    }
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
