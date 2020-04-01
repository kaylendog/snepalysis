import chalk from 'chalk';

/**
 * Built-in log function.
 */
const _log = (prefix: string) => (...content: string[]): void =>
  console.log(prefix, ...content);

/**
 * Simple coloured loggin
 */
export const log = {
  info: _log(chalk.hex('#fc9867')`info`),
  success: _log(chalk.green`success`),
  list: (current: number, max: number, ...content: string[]): void =>
    _log(chalk.gray`[${current}/${max}]`)(...content),
  done: _log('✨'),
  error: _log(chalk.redBright`error`),
  warn: _log(chalk.yellow`warn`),
  debug: _log(chalk.blue`debug`),
  verbose: _log(chalk.gray`verbose`),
};
