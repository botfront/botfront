import winston, { format } from 'winston';
import { cloneDeep } from 'lodash';

const { LoggingWinston } = require('@google-cloud/logging-winston');

const {
    combine, timestamp: timestampfn, printf, colorize,
} = format;

const {
    APPLICATION_LOG_LEVEL = 'info',
    APPLICATION_LOG_TRANSPORT,
    AUDIT_LOG_TRANSPORT,
    APPLICATION_LOGGER_NAME,
    AUDIT_LOGGER_NAME,
    MAX_LOGGED_ARG_LENGTH = 1000,
    MAX_LOGGED_DATA_LENGTH = 100,
} = process.env;

const allowdKeysApp = [
    'message',
    'level',
    'userId',
    'file',
    'method',
    'url',
    'data',
    'timestamp',
    'args',
    'status',
    'error',
    'params',
];

const allowdKeysAudit = [
    'level',
    'message',
    'status',
    'userId',
    'label',
    'type',
    'timestamp',
    'before',
    'after',
];

const spaceBeforeIfExist = prop => (prop ? ` ${prop}` : '');

const auditFormat = printf((arg) => {
    Object.keys(arg).forEach((key) => {
        if (!allowdKeysAudit.includes(key)) {
            throw new Error(`${key} not allowed in audit logs`);
        }
    });
    const {
        level, message, status, userId, label, type, timestamp, before, after,
    } = arg;

    let additionalInfo = '';
    if (before) additionalInfo = `before: ${before}`;
    if (after) additionalInfo = additionalInfo.concat(`after: ${after}`);
    return `${timestamp} [${label.toUpperCase()}] ${level}:${
        userId ? ` userId: ${userId}` : ''
    }${spaceBeforeIfExist(type)}${spaceBeforeIfExist(status)}${spaceBeforeIfExist(
        message,
    )}${spaceBeforeIfExist(additionalInfo)}`;
});

const checkDataType = (dataType, data) => {
    if (dataType && dataType !== 'application/json') {
        return 'Too much data.';
    }
    return data;
};

const appLogToString = (arg) => {
    const {
        message,
        level,
        userId,
        file,
        method,
        url,
        data,
        timestamp,
        args,
        status,
        error,
        params,
    } = arg;
    let loggedData = data;
    if (data && data.mimeType) loggedData = checkDataType(data.mimeType, data);
    if (loggedData && JSON.stringify(loggedData).length > MAX_LOGGED_DATA_LENGTH) loggedData = 'Too much data.';
    // the log is from a method
    if (method && args) {
        return `${timestamp} [${level}] : ${message} ${
            userId ? `user: ${userId}` : ''
        } ${file} - ${method} with ${JSON.stringify(args)}${spaceBeforeIfExist(status)} ${
            url ? `url: ${url}` : ''
        } ${params ? `params: ${JSON.stringify(params)}` : ''} ${
            loggedData ? `data: ${JSON.stringify(loggedData)}` : ''
        } ${error ? `error: ${error}` : ''}`;
    }
    
    // if it's not from a method it's at the file level
    return `${timestamp} [${level}] : ${message} ${file}`;
};

const appFormat = printf((arg) => {
    Object.keys(arg).forEach((key) => {
        if (!allowdKeysApp.includes(key)) {
            throw new Error(`${key} not allowed in application logs`);
        }
    });

   
    if (arg.args && /info/.test(arg.level) && APPLICATION_LOG_LEVEL === 'info') {
        const argLite = cloneDeep(arg);
        Object.keys(argLite.args).forEach((key) => {
            if (JSON.stringify(argLite.args[key]).length > MAX_LOGGED_ARG_LENGTH) {
                argLite.args[key] = `${key} is too long for to be logged at info level`;
            }
        });
        return appLogToString(argLite);
    }

    return appLogToString(arg);
});

const appStackDriver = new LoggingWinston({
    logName: `${APPLICATION_LOGGER_NAME || 'botfront_log_app'}`,
});

const auditStackDriver = new LoggingWinston({
    logName: `${AUDIT_LOGGER_NAME || 'botfront_log_audit'}`,
});

const appLogTransport = [];
if (!!APPLICATION_LOG_TRANSPORT) {
    if (APPLICATION_LOG_TRANSPORT.includes('console')) {
        appLogTransport.push(
            new winston.transports.Console({
                format: combine(timestampfn(), colorize(), appFormat),
            }),
        );
    }
    if (APPLICATION_LOG_TRANSPORT.includes('stackdriver')) {
        appLogTransport.push(appStackDriver);
    }
} else {
    appLogTransport.push(
        new winston.transports.Console({
            format: combine(timestampfn(), colorize(), appFormat),
        }),
    );
}

const auditLogTransport = [];
if (!!AUDIT_LOG_TRANSPORT) {
    if (AUDIT_LOG_TRANSPORT.includes('console')) {
        auditLogTransport.push(new winston.transports.Console());
    }
    if (AUDIT_LOG_TRANSPORT.includes('stackdriver')) {
        auditLogTransport.push(auditStackDriver);
    }
} else {
    auditLogTransport.push(new winston.transports.Console());
}

const appLogger = winston.createLogger({
    level: APPLICATION_LOG_LEVEL,
    format: combine(timestampfn(), appFormat),
    transports: appLogTransport,
});

const auditLogger = winston.createLogger({
    level: 'info',
    format: combine(timestampfn(), auditFormat),
    transports: auditLogTransport,
});

export const getAppLoggerForFile = filename => appLogger.child({ file: filename });

export const getAuditLoggerForFile = label => auditLogger.child({ label });

export const getAppLoggerForMethod = (fileLogger, method, userId, args) => fileLogger.child({ method, userId, args });

export const getAuditLoggerForMethod = (fileLogger, type, userId) => fileLogger.child({ type, userId });

const logBeforeApiCall = (logger, text, meta) => {
    const { url } = meta;
    if (APPLICATION_LOG_LEVEL === 'debug') {
        logger.debug(text, { ...meta });
    } else {
        logger.info(text, { url });
    }
};

const logAfterSuccessApiCall = (logger, text, meta) => {
    const { status, url } = meta;
    if (APPLICATION_LOG_LEVEL === 'debug') {
        logger.debug(text, { ...meta });
    } else {
        logger.info(text, { status, url });
    }
};

const getProperUrl = (baseURL = '', url = '') => (/^h/.test(url) ? url : baseURL + url);

export const addLoggingInterceptors = (axios, logger) => {
    let dataType; // this variable will receive a value at request time
    /* data type is stringified in the response object
    keeping it outside allow us to properly handle the type of the data in the response without having to parse it everytime
    */
    axios.interceptors.request.use(
        (config) => {
            const {
                baseURL, url, data = null, method, params,
            } = config;
            dataType = data && data.mimeType;
            logBeforeApiCall(logger, `${method.toUpperCase()} at ${url}`, {
                url: getProperUrl(baseURL, url),
                data,
                params,
            });
            return config;
        },
        (error) => {
            const {
                url, baseURL, data = null, method, params,
            } = error;
            logger.error(`${method} at ${url} failed at request time`, {
                error,
                data,
                url: getProperUrl(baseURL, url),
                params,
            });
            return Promise.reject(error);
        },
    );

    /* Sometimes the content headers are set to json
    however the content in the data property could have another mimeType, that's why there is a double check of the type */
    axios.interceptors.response.use(
        (response) => {
            const { config, status, data = null } = response;
            const { url } = config;
            // we don't log files or others data type that are not json
          
            const loggedData = checkDataType(dataType, data);

            logAfterSuccessApiCall(
                logger,
                `${config.method.toUpperCase()} at ${url} succeeded`,
                { status, data: loggedData, url },
            );
            
            return response;
        },
        (error) => {
            if (Object.keys(error).length > 0) {
                const { config } = error;
                const {
                    data, status, url, method,
                } = config;
                const loggedData = checkDataType(dataType, data);
                logger.error(
                    `${method.toUpperCase()} at ${url} failed at response time`,
                    {
                        data: loggedData,
                        status,
                        error,
                        url,
                    },
                );
            } else {
                logger.error(error.toString());
            }
            return Promise.reject(error);
        },
    );
};
