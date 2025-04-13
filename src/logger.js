/**
 * This module sets up and exports a Winston logger instance.
 * Winston is a versatile logging library for Node.js.
 * 
 * The logger is configured with the following settings:
 * - Default logging level: 'info'
 * - Log format: JSON with timestamp and error stack trace
 * - Default metadata: { service: 'your-service-name' }
 * - Transports:
 *   - Console: Logs all levels to the console
 *   - File (error.log): Logs 'error' level messages to a file
 *   - File (combined.log): Logs all levels to a file
 * 
 * Usage:
 * const logger = require('./logger');
 * logger.info('This is an info message');
 * logger.error('This is an error message');
 */
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info', // Set the default logging level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'group-messaging-api' },
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({ filename: 'error.log', level: 'error' }), // Log errors to a file
    new transports.File({ filename: 'combined.log' }) // Log all levels to a file
  ]
});

module.exports = logger;