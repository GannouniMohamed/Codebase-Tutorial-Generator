import winston from 'winston';
import chalk from 'chalk';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      const color = level === 'error' ? 'red' : level === 'warn' ? 'yellow' : 'white';
      return `${timestamp} ${chalk[color](level.toUpperCase())}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

export function logInfo(message: string): void {
  logger.info(message);
}

export function logError(message: string, error?: Error): void {
  if (error) {
    logger.error(`${message}: ${error.message}`, { error });
  } else {
    logger.error(message);
  }
}

export function logWarning(message: string): void {
  logger.warn(message);
}

export function logDebug(message: string): void {
  logger.debug(message);
} 