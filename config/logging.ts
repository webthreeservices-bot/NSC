import { createLogger, format, transports } from 'winston'
import * as path from 'path'

const { combine, timestamp, printf, colorize, json } = format

// Custom format for development logs
const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} ${level}: ${message}`
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`
  }
  return msg
})

// Configure log directory
const LOG_DIR = process.env.LOG_DIR || 'logs'
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 5

// Create logger instance based on environment
const logger = createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: combine(
    timestamp(),
    process.env.NODE_ENV === 'production' ? json() : combine(colorize(), devFormat)
  ),
  transports: [
    // Always log to console
    new transports.Console({
      format: combine(
        colorize(),
        devFormat
      )
    }),
    
    // Error logs
    new transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      maxsize: MAX_SIZE,
      maxFiles: MAX_FILES
    }),
    
    // Database specific logs
    new transports.File({
      filename: path.join(LOG_DIR, 'db.log'),
      level: 'debug',
      maxsize: MAX_SIZE,
      maxFiles: MAX_FILES
    }),
    
    // API request logs
    new transports.File({
      filename: path.join(LOG_DIR, 'api.log'),
      level: 'http',
      maxsize: MAX_SIZE,
      maxFiles: MAX_FILES
    }),

    // Application logs
    new transports.File({
      filename: path.join(LOG_DIR, 'app.log'),
      maxsize: MAX_SIZE,
      maxFiles: MAX_FILES
    })
  ],
  // Prevent winston from exiting on error
  exitOnError: false
})

// Add request logging for API endpoints
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    logger.http({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    })
  })
  
  next()
}

// Create child loggers for different modules
export const dbLogger = logger.child({ module: 'database' })
export const apiLogger = logger.child({ module: 'api' })
export const cronLogger = logger.child({ module: 'cron' })
export const authLogger = logger.child({ module: 'auth' })

export default logger