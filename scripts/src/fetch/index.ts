import { existsSync, rmdirSync, mkdirSync } from 'fs';
import { DIRECTORY } from './env';
import * as path from 'path';

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

import {
  cloneRepository,
  updateRepository,
  readRepository,
  updateDatabase,
} from './tasks';

const START = Date.now();

(async (): Promise<void> => {
  await cloneRepository();

  let shouldUpdate = false;

  if (!process.argv.includes('-o')) {
    shouldUpdate = await updateRepository();
  }

  if (!shouldUpdate && !process.argv.includes('-f')) {
    return console.log('info: Not updating database - repo is fine.');
  }

  const entries = await readRepository();
  await updateDatabase(entries);

  console.log(`✨ Done in ${Math.floor((Date.now() - START) / 10) / 100}s.`);
})();
