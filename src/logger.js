import * as winston from "winston";

const defaultFormat = winston.format.printf((info) => {
  return `${info.timestamp} [${info.level}]: ${info.message}`;
});

const prettyJson = winston.format.printf(info => {
  if (info.message.constructor === Object) {
    info.message = JSON.stringify(info.message, null, 4)
  }
  return `${info.timestamp} [${info.level}]: ${info.message}`;
})

const createDevLogger = () => {
  return winston.createLogger({
    level: "silly",
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          defaultFormat,
          prettyJson,
        ),
      }),
    ],
  });
};

const logger = createDevLogger()

export default logger