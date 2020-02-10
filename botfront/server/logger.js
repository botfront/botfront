import winston, { format } from 'winston';

const { LoggingWinston } = require('@google-cloud/logging-winston');
 
const loggingWinston = new LoggingWinston({
    logName: 'botfront-log',
});

const {
    combine, timestamp, printf,
} = format;

const spaceBeforeIfExist = prop => (prop ? ` ${prop}` : '');


const auditFormat = printf(({
    // eslint-disable-next-line no-shadow
    level, message, status, userId, label, type, timestamp, before, after,
}) => {
    let additionalInfo = '';
    if (before) additionalInfo = `before: ${before}`;
    if (after) additionalInfo = additionalInfo.concat(`after: ${after}`);
    return `${timestamp} [${label.toUpperCase()}] ${level}:${userId ? ` userId: ${userId}` : ''}${spaceBeforeIfExist(type)}${spaceBeforeIfExist(status)}${spaceBeforeIfExist(message)}${spaceBeforeIfExist(additionalInfo)}`;
});


const appFormat = printf(arg => JSON.stringify(arg));

let level = 'silly';
if (process.env.NODE_ENV === 'production') {
    level = 'info';
}


export const appLogger = winston.createLogger({
    level,
    format: combine(timestamp(), appFormat),
    transports: [
        new winston.transports.Console(),
        loggingWinston,
    ],
});


export const auditLogger = winston.createLogger({
    level,
    format: combine(
        timestamp(),
        auditFormat,
    ),
    transports: [
        new winston.transports.Console(),
    ],
});
