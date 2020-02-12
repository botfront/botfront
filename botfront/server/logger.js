import winston, { format } from 'winston';
import { cloneDeep } from 'lodash';

const { LoggingWinston } = require('@google-cloud/logging-winston');

const {
    combine, timestamp: timestampfn, printf, colorize,
} = format;

const {
    APPLICATION_LOG_LEVEL,
    APPLICATION_LOG_TRANSPORT,
    AUDIT_LOG_TRANSPORT,
    APPLICATION_LOGGER_NAME,
    AUDIT_LOGGER_NAME,
    MAX_LOGGED_ARG_LENGTH = 1000,
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

const logToString = (arg) => {
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
    } = arg;
    return `${timestamp} [${level}] : ${message} ${
        userId ? `user: ${userId}` : ''
    } ${file} - ${method} with ${JSON.stringify(args)} ${
        url ? `url: ${url}` : ''
    }${spaceBeforeIfExist(status)} ${data ? `data: ${JSON.stringify(data)}` : ''} ${
        error ? `error: ${error}` : ''
    }`;
};
const appFormat = printf((arg) => {
    Object.keys(arg).forEach((key) => {
        if (!allowdKeysApp.includes(key)) {
            throw new Error(`${key} not allowed in application logs`);
        }
    });
    if (arg.args && arg.level === 'info' && APPLICATION_LOG_LEVEL === 'info') {
        const argLite = cloneDeep(arg);
        Object.keys(argLite.args).forEach((key) => {
            if (JSON.stringify(argLite.args[key]).length > MAX_LOGGED_ARG_LENGTH) {
                // eslint-disable-next-line no-param-reassign
                argLite.args[key] = `${key} is too long for to be logged at info level`;
            }
        });
        return logToString(argLite);
    }

    return logToString(arg);
});

const appStackDriver = new LoggingWinston({
    logName: `${APPLICATION_LOGGER_NAME || 'botfront_log_app'}`,
});

const auditStackDriver = new LoggingWinston({
    logName: `${AUDIT_LOGGER_NAME || 'botfront_log_audit'}`,
});

let level = 'info';
if (!!APPLICATION_LOG_LEVEL) {
    level = APPLICATION_LOG_LEVEL;
}

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

export const appLogger = winston.createLogger({
    level,
    format: combine(timestampfn(), appFormat),
    transports: appLogTransport,
});

export const auditLogger = winston.createLogger({
    level: 'silly',
    format: combine(timestampfn(), auditFormat),
    transports: auditLogTransport,
});

function logBeforeApiCall(logger, text, meta) {
    const { data, url } = meta;
    logger.info(text, { url });
    logger.debug(`${text} data`, { data, url });
}

function logAfterSuccessApiCall(logger, text, meta) {
    const { status, data, url } = meta;
    logger.info(text, { status, url });
    if (data) {
        logger.debug(`${text} data`, { status, url, data });
    }
}

export function addLoggingInterceptors(axios, logger) {
    axios.interceptors.request.use(
        function(config) {
            const { url, data = null, method } = config;
            logBeforeApiCall(logger, `${method.toUpperCase()} at ${url}`, { url, data });
            return config;
        },
        function(error) {
            const { url, method } = error;
            logger.error(`${method} at ${url} failed at request time`, { error, url });
            return Promise.reject(error);
        },
    );

    axios.interceptors.response.use(
        function(response) {
            const { config, status, data = null } = response;
            const { url } = config;
            // we don't log files or others data type that are not json
            if (response.headers['content-type'] !== 'application/json') {
                logAfterSuccessApiCall(
                    logger,
                    `${config.method.toUpperCase()} at ${url} succeeded`,
                    { status, url },
                );
            } else {
                logAfterSuccessApiCall(
                    logger,
                    `${config.method.toUpperCase()} at ${url} succeeded`,
                    { status, data, url },
                );
            }

            return response;
        },
        function(error) {
            if (Object.keys(error).length > 0) {
                const { config } = error;
                const {
                    data, status, url, method,
                } = config;
                logger.error(
                    `${method.toUpperCase()} at ${url} failed at response time`,
                    {
                        data,
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
}
