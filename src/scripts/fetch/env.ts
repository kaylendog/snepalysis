/**
 * Command-line argument parsing
 */

import { existsSync, rmdirSync, mkdirSync } from 'fs';
import * as path from 'path';

const DEFAULT_COUNTRY = 'any';
const DEFAULT_STATE = 'any';

/**
 * The country to filter for, defaults to `any`.
 */
let COUNTRY = DEFAULT_COUNTRY;

/**
 * The state to filter for, defaults to `any`.
 */
let STATE = DEFAULT_STATE;

const countryIndex = process.argv.indexOf('-c');
const stateIndex = process.argv.indexOf('-s');

if (countryIndex != -1) {
  if (process.argv[countryIndex + 1].startsWith('-')) {
    console.error(
      `Invalid use of flag '-c', found flag '${process.argv[countryIndex + 1]}'`
    );
    process.exit(1);
  }

  COUNTRY = process.argv[countryIndex + 1];
}

if (stateIndex != -1) {
  if (process.argv[stateIndex + 1].startsWith('-')) {
    console.error(
      `Invalid use of flag '-c', found flag '${process.argv[stateIndex + 1]}'`
    );
    process.exit(1);
  }

  STATE = process.argv[stateIndex + 1];
}

if (process.argv.includes('-f')) {
  console.log('warn: -f argument specified - will update database');
}

if (process.argv.includes('-o')) {
  console.log('warn: -o argument specified - will not attempt to pull updates');
}

/**
 * The directory in which data will be stored and downloaded to.
 */
const DIRECTORY = path.resolve(process.cwd(), './.cache');

/**
 * The path to the data directory of the repository.
 */
const DATA_PATH = path.resolve(
  DIRECTORY,
  'csse_covid_19_data/csse_covid_19_daily_reports'
);

/**
 * THe URL of the data repository.
 */
const REPOSITORY_URL = 'https://github.com/CSSEGISandData/COVID-19.git';

if (existsSync(DIRECTORY) && !existsSync(path.resolve(DIRECTORY, '.git'))) {
  /**
   * Git doesn't allow cloning if the path you're trying to clone to already exists. This check below,
   * and the next one, determine whether:
   *  a) The repository is alreay cloned locally
   *  b) The directory exists, but is empty.
   */

  rmdirSync(DIRECTORY);
} else if (!existsSync(DIRECTORY)) {
  mkdirSync(DIRECTORY);
}

export { COUNTRY, STATE, DATA_PATH, DIRECTORY, REPOSITORY_URL };
