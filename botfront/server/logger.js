import winston, { format } from 'winston';

const {
    combine, timestamp, printf,
} = format;

const myFormat = printf(({
    level, message, result, userId, label, type, timestamp, before, after,
}) => {
    let additionalInfo = '';
    if (before) additionalInfo = `before: ${before}`;
    if (after) additionalInfo = additionalInfo.concat(`after: ${after}`);

    return `${timestamp} [${label.toUpperCase()}] ${level}: ${userId ? `user: ${userId}` : ''} ${type || ''} ${result || ''} ${message} ${additionalInfo}`;
});


let level = 'silly';
if (process.env.NODE_ENV === 'production') {
    level = 'error';
}


const logger = winston.createLogger({
    level,
    format: combine(
        timestamp(),
        myFormat,
    ),
    transports: [
        new winston.transports.Console(),
    ],
});
  
export default logger;
