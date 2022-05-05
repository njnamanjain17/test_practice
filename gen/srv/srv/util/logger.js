'use strict';
/*  Imports  */
const winston = require('winston');
/* Winston Logger Instance with configurations*/
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL,
    defaultMeta: { service: 'catalog-service' },
    transports: [
        new winston.transports.Console()
    ],
});
/* Logging error  */
function getErrorLogger(fileName, methodName, errorCode, error) {
    logger.error(`${fileName} :: ${methodName} :: ${errorCode}: ${error}`);
}
/* Logging Message*/
function getLogger(fileName, methodName, message) {
    logger.info(`${fileName} :: ${methodName} :: ${message}`);
}
module.exports.getErrorLogger = getErrorLogger;
module.exports.getLogger = getLogger;
