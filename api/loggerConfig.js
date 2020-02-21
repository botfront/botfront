
const { LoggingWinston } = require('@google-cloud/logging-winston');
const winston = require('winston');
const {
    APPLICATION_API_LOG_LEVEL, APPLICATION_API_LOG_TRANSPORT, APPLICATION_API_LOGGER_NAME,
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
    logsTransport.push(new winston.transports.Console());
}

module.exports = { logsTransport };

