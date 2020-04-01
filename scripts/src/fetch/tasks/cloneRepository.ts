import { existsSync } from 'fs';
import * as path from 'path';

import { DIRECTORY, REPOSITORY_URL } from '../env';
import { git } from '../git';

/**
 * Clone the remote repository.
 */
export const cloneRepository = async (): Promise<void> => {
  if (existsSync(path.resolve(DIRECTORY, './.git'))) {
    // Don't try and reclone the repo if it already exists locally.
    return;
  }

  console.log('info: Cloning repository...');

  await git.clone(REPOSITORY_URL, DIRECTORY);
  await git.status();
};
