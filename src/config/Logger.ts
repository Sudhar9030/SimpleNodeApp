import winston from "winston";

const  { combine, timestamp, json, errors, colorize, splat, simple } = winston.format;

export default winston.createLogger({
    level: 'debug',
    format: combine(splat(), errors({stack: true}), timestamp(), json(), colorize()),
    transports: [new winston.transports.Console()]
});

