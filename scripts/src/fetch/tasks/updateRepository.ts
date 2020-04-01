import { git } from '../git';

/**
 * Pulls any updates made to the repository on the remote to the local.
 */
export const updateRepository = async (): Promise<boolean> => {
  console.log('info: Checking for updates...');
  const stats = await git.pull('origin', 'master', ['-f']);
  if (stats.summary.changes == 0) {
    return false;
  }
  return true;
};
