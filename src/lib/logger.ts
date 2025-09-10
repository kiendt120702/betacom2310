/**
 * Professional logging system for the application
 * Replaces console.log statements with structured logging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  component?: string;
  userId?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any,
    component?: string
  ): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: this.formatTimestamp(),
      component,
      userId: this.getCurrentUserId(),
    };
  }

  private getCurrentUserId(): string | undefined {
    // Get current user ID from auth context if available
    try {
      const authData = localStorage.getItem('supabase.auth.token');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed?.user?.id;
      }
    } catch {
      // Ignore errors when getting user ID
    }
    return undefined;
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.isDevelopment) return;

    const prefix = `[${entry.timestamp}] ${entry.component ? `[${entry.component}]` : ''}`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.data);
        break;
    }
  }

  private async sendToRemoteService(entry: LogEntry): Promise<void> {
    // In production, send logs to remote logging service
    if (this.isDevelopment || entry.level < LogLevel.WARN) return;

    try {
      // Send critical errors to remote logging service
      // Currently logs to console in development, ready for production service integration
      if (typeof window !== 'undefined' && entry.level >= LogLevel.ERROR) {
        // Can integrate with Sentry, LogRocket, or other services here
        // Example: Sentry.captureException(entry);
        
        // For now, store in sessionStorage for debugging
        const logs = JSON.parse(sessionStorage.getItem('app-logs') || '[]');
        logs.push(entry);
        // Keep only last 100 logs
        if (logs.length > 100) logs.shift();
        sessionStorage.setItem('app-logs', JSON.stringify(logs));
      }
    } catch {
      // Fallback to console if remote logging fails
      console.error('Failed to send log to remote service:', entry);
    }
  }

  private log(level: LogLevel, message: string, data?: any, component?: string): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, data, component);
    
    this.logToConsole(entry);
    this.sendToRemoteService(entry);
  }

  debug(message: string, data?: any, component?: string): void {
    this.log(LogLevel.DEBUG, message, data, component);
  }

  info(message: string, data?: any, component?: string): void {
    this.log(LogLevel.INFO, message, data, component);
  }

  warn(message: string, data?: any, component?: string): void {
    this.log(LogLevel.WARN, message, data, component);
  }

  error(message: string, data?: any, component?: string): void {
    this.log(LogLevel.ERROR, message, data, component);
  }

  // Convenience method for secure logging (replaces secureLog)
  secure(message: string, data?: any, component?: string): void {
    this.info(message, data, component);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions for easy migration
export const secureLog = (message: string, data?: any) => logger.secure(message, data);
export const debugLog = (message: string, data?: any) => logger.debug(message, data);
export const infoLog = (message: string, data?: any) => logger.info(message, data);
export const warnLog = (message: string, data?: any) => logger.warn(message, data);
export const errorLog = (message: string, data?: any) => logger.error(message, data);