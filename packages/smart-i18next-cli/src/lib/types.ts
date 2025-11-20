/**
 * Logger interface for consistent output formatting across the toolkit.
 * Implementations can customize how messages are displayed or stored.
 *
 * @example
 * ```typescript
 * class FileLogger implements Logger {
 *   info(message: string) { fs.appendFileSync('info.log', message) }
 *   warn(message: string) { fs.appendFileSync('warn.log', message) }
 *   error(message: string) { fs.appendFileSync('error.log', message) }
 * }
 * ```
 */
export interface ILogger {
  /**
   * Logs an informational message.
   * @param message - The message to log
   */
  info(message: string): void;

  /**
   * Logs a warning message.
   * @param message - The warning message to log
   */
  warn(message: string): void;

  /**
   * Logs an error message.
   * @param message - The error message to log
   */
  error(message: string | any): void;
}
