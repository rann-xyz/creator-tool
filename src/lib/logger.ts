type LogLevel = 'error' | 'warn' | 'info' | 'debug'

class Logger {
  private isEnabled = process.env.NODE_ENV === 'development'

  private format(level: LogLevel, message: string, meta?: Record<string, any>) {
    if (!this.isEnabled && level === 'debug') return
    
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      ...(meta ? { meta: this.sanitize(meta) } : {}),
    }
    
    console.error(JSON.stringify(logEntry))
  }

  private sanitize(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
      // Never log sensitive data
      if (['apiKey', 'password', 'token', 'secret', 'key'].includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]'
        continue
      }
      sanitized[key] = value
    }
    return sanitized
  }

  error(message: string, meta?: Record<string, any>) {
    this.format('error', message, meta)
  }

  warn(message: string, meta?: Record<string, any>) {
    this.format('warn', message, meta)
  }

  info(message: string, meta?: Record<string, any>) {
    this.format('info', message, meta)
  }

  debug(message: string, meta?: Record<string, any>) {
    this.format('debug', message, meta)
  }
}

export const logger = new Logger()