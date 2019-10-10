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
    if (error.code === 'ENOTFOUND') {
        return 'The botfront API was not found. Please verify your api url host setting is correct.';
    }
    if (error.code === 'ECONNREFUSED') {
        return 'The Botfront api connection was refused. Please verify that you are accessing the correct port by checking your api url host setting.';
    }
    return `Error code: ${error.code}`;
};

export const generateImportResponse = (statusCode) => {
    if (statusCode === 200) {
        return ({ success: true, statusCode });
    }
    if (statusCode === 422) {
        return ({
            success: false,
            errorMessage: {
                header: 'Import Failed', text: 'The uploaded file is not a valid Botfront JSON file.',
            },
        });
    }
    return ({
        success: false,
        errorMessage: {
            header: 'Import Failed', text: `the request to the Botfront API failed. status: ${statusCode}`,
        },
    });
};
