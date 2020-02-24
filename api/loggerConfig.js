
const { LoggingWinston } = require('@google-cloud/logging-winston');
const winston = require('winston');
const packageInfo = require('./package.json');
const {
    APPLICATION_API_LOG_LEVEL, APPLICATION_API_LOG_TRANSPORT, APPLICATION_API_LOGGER_NAME, MAX_LOG_BODY_LENGTH = 1000,
} = process.env;


const appStackDriver = new LoggingWinston({
    logName: `${APPLICATION_API_LOGGER_NAME || 'botfront-api_log_app'}`,
    level: APPLICATION_API_LOG_LEVEL,
});


const logsTransport = [];
if (!!APPLICATION_API_LOG_TRANSPORT) {
    if (APPLICATION_API_LOG_TRANSPORT.includes('console'))  logsTransport.push(new winston.transports.Console({level:  APPLICATION_API_LOG_LEVEL}));
    if (APPLICATION_API_LOG_TRANSPORT.includes('stackdriver'))  logsTransport.push(appStackDriver);
} else {
    logsTransport.push(new winston.transports.Console({level:  APPLICATION_API_LOG_LEVEL}))
}



const checkBodyLength = (meta, key) => (meta !==undefined
    && meta[key]
    && meta[key].body
    && JSON.stringify(meta[key].body).length > MAX_LOG_BODY_LENGTH);


const customFormat = winston.format.printf((arg) => {
    const {timestamp, level, message, meta} = arg
    const cleanedMeta = meta || ''
    if (checkBodyLength(cleanedMeta, 'res')){
        cleanedMeta.res.body = 'Body is too large.'
    }
    if (checkBodyLength(cleanedMeta, 'req')){
        cleanedMeta.req.body = 'Body is too large.'
    }
    if (cleanedMeta !== '')
        return `${timestamp} [${level}]: ${message}  res: ${JSON.stringify(cleanedMeta.res)}  req: ${JSON.stringify(cleanedMeta.req)} `
    return `${timestamp} [${level}]: ${message}`
});


const winstonInstance= winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        customFormat),
    transports: logsTransport,
});

winstonInstance.info(`Botfront api ${packageInfo.version} started`)

module.exports = { winstonInstance, logsTransport };